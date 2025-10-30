class PlaidService < BaseService
  def initialize(account_id:, plaid_access_tokens: nil)
    @account = Account.find(account_id)
    @plaid_access_tokens = plaid_access_tokens
  end

  private def update_balance_for_account(plaid_sync_response:)
    begin
      plaid_sync_response.accounts.each do |plaid_api_account|
        Rails.logger.info "Updating balance for account #{plaid_api_account.account_id}"
        plaid_account = PlaidAccount.find_by(plaid_id: plaid_api_account.account_id, account_id: @account.id)
        next unless plaid_account
        current = plaid_api_account.balances.current&.to_f
        available = plaid_api_account.balances.available&.to_f
        limit = plaid_api_account.balances.limit&.to_f
        
        # Create account balance for each user associated with this plaid_account
        plaid_account.plaid_accounts_users.each do |plaid_accounts_user|
          plaid_accounts_user.account_balances.create(
            current_balance: current,
            available_balance: available,
            limit: limit,
          )
        end
        
        Rails.logger.info "Balance updated for account #{plaid_api_account.account_id}"
      end
    rescue => exception
      Rails.logger.error "Error updating balance for account #{@account.id}: #{exception.message}"
      Rails.logger.error exception.backtrace.join("\n")
    end
  end

  def sync_transactions
    Rails.logger.info "Syncing transactions for account #{@account.id}"

    access_tokens = @account.plaid_access_tokens
    
    access_tokens.each do |access_token|
      plaid_sync_event = PlaidSyncEvent.create!(
        account_id: @account.id,
        plaid_access_token_id: access_token.id,
        event_type: "STARTED",
        started_at: Time.now,
        cursor: access_token.next_cursor,
      )
      
      sync_request = Plaid::TransactionsSyncRequest.new(
        client_id: ENV["PLAID_CLIENT_ID"],
        secret: ENV["PLAID_SECRET"],
        access_token: access_token.token,
        cursor: access_token.next_cursor,
      )
      
      # Make the API request
      sync_response = api_client.transactions_sync(sync_request)
      
      # Process the transactions in the response
      transaction_count = sync_response.added.count + sync_response.modified.count + sync_response.removed.count
      Rails.logger.info "Processing #{transaction_count} transactions for account #{@account.id} sync event #{plaid_sync_event.id}"
      add_transactions(sync_response.added, plaid_sync_event)
      update_transactions(sync_response.modified, plaid_sync_event)
      remove_transactions(sync_response.removed, plaid_sync_event)

      # Update the cursor and next cursor and sync event
      plaid_sync_event.update(cursor: sync_response.next_cursor)
      access_token.update(next_cursor: sync_response.next_cursor)

      # Update the balance for the account
      update_balance_for_account(plaid_sync_response: sync_response)

      # If there are more pages to sync, continue
      while sync_response.has_more
        Rails.logger.info "Processing more transactions for account #{@account.id} sync event #{plaid_sync_event.id}"
        cursor = sync_response.next_cursor
        access_token.update(next_cursor: cursor)

        sync_request.cursor = cursor
        sync_response = api_client.transactions_sync(sync_request)

        added_transactions = sync_response.added
        modified_transactions = sync_response.modified
        removed_transactions = sync_response.removed

        add_transactions(added_transactions, plaid_sync_event)
        update_transactions(modified_transactions, plaid_sync_event)
        remove_transactions(removed_transactions, plaid_sync_event)

        # Enrich the transactions
        # enrich_transactions(transactions: added_transactions + modified_transactions)

        plaid_sync_event.update(cursor: sync_response.next_cursor)
        access_token.update(next_cursor: sync_response.next_cursor)
      end

      plaid_sync_event.update(event_type: "COMPLETED", completed_at: Time.now)
    end
  end

  private def add_transactions(transactions, plaid_sync_event)
    Rails.logger.info("Adding #{transactions.count} transactions for account #{@account.id} sync event #{plaid_sync_event.id}")
    transactions.each do |transaction|
      plaid_account = PlaidAccount.find_by(plaid_id: transaction.account_id, account_id: @account.id)
      
      transaction_attrs = PlaidTransaction.parse_plaid_transaction(transaction, @account, plaid_account, plaid_sync_event)
      new_transaction = PlaidTransaction.new(transaction_attrs)

      merchant = merchant_for_transaction(transaction, transaction.merchant_entity_id)
      new_transaction.merchant_id = merchant.id
      new_transaction.save
    end
  end

  private def update_transactions(transactions, plaid_sync_event)
    Rails.logger.info("Updating #{transactions.count} transactions for account #{@account.id} sync event #{plaid_sync_event.id}")
    transactions.each do |transaction|
      existing_transaction = PlaidTransaction.find_by(plaid_id: transaction.transaction_id)
      plaid_account = PlaidAccount.find_by(plaid_id: transaction.account_id, account_id: @account.id)
      
      transaction_attrs = PlaidTransaction.parse_plaid_transaction(transaction, @account, plaid_account, plaid_sync_event)
      existing_transaction.update(transaction_attrs)
    end
  end

  private def remove_transactions(transactions, plaid_sync_event)
    Rails.logger.info("Removing #{transactions.count} transactions for account #{@account.id} sync event #{plaid_sync_event.id}")
    transactions.each do |transaction|
      plaid_transaction = PlaidTransaction.find_by(plaid_id: transaction.transaction_id)

      if plaid_transaction
        plaid_transaction&.destroy
      end
    end
  end

  private def merchant_for_transaction(transaction, plaid_entity_id)
    # lookup by plaid id
    merchant = @account.merchants.where(plaid_entity_id: plaid_entity_id).where.not(plaid_entity_id: nil).first
    update_merchant(merchant, transaction) if merchant
    return merchant if merchant

    # lookup by name
    merchant = Merchant.find_by(merchant_name: transaction.merchant_name || transaction.name)
    update_merchant(merchant, transaction) if merchant
    return merchant if merchant

    # It does not exist, create it
    merchant = Merchant.create(
      account_id: @account.id,
      plaid_entity_id: plaid_entity_id,
      merchant_name: transaction.merchant_name || transaction.name,
      logo_url: transaction.logo_url,
    )

    return merchant
  end

  private def update_merchant(merchant, transaction)
    merchant.update(
      logo_url: transaction.logo_url,
    )
    merchant.save
  end

  private def normalize_merchant_name(name)
    return "" if name.blank?
    
    name.downcase
        .gsub(/[^a-z0-9\s]/, '')
        .gsub(/\s+/, ' ')
        .strip
  end

  private def calculate_name_similarity(name1, name2)
    return 0.0 if name1.blank? || name2.blank?
    
    words1 = name1.split(' ')
    words2 = name2.split(' ')
    
    common_words = words1 & words2
    total_words = (words1 + words2).uniq.length
    
    return 0.0 if total_words == 0
    
    common_words.length.to_f / total_words
  end

  def create_link_token(user:)
    request = Plaid::LinkTokenCreateRequest.new(
      {
        client_id: ENV["PLAID_CLIENT_ID"],
        secret: ENV["PLAID_SECRET"],
        client_name: 'Budgeting App',
        products: ['transactions'],
        country_codes: ['US'],
        language: 'en',
        user: {
          client_user_id: user.id.to_s,
          legal_name: "#{user.first_name} #{user.last_name}",
          email_address: user.email
        }
      }
    )
    
    response = api_client.link_token_create(request)
    response.link_token
  end

  def exchange_public_token(public_token)
    request = Plaid::ItemPublicTokenExchangeRequest.new(
      {
        client_id: ENV["PLAID_CLIENT_ID"],
        secret: ENV["PLAID_SECRET"],
        public_token: public_token
      }
    )
    
    api_client.item_public_token_exchange(request)
  end

  def get_accounts(access_token)
    request = Plaid::AccountsGetRequest.new(
      {
        client_id: ENV["PLAID_CLIENT_ID"],
        secret: ENV["PLAID_SECRET"],
        access_token: access_token
      }
    )
    
    api_client.accounts_get(request)
  end

  def api_client
    configuration = Plaid::Configuration.new
    plaid_env = ENV.fetch("PLAID_ENV", "production")
    configuration.server_index = Plaid::Configuration::Environment[plaid_env]

    api_client = Plaid::ApiClient.new(configuration)

    return Plaid::PlaidApi.new(api_client)
  end

end
