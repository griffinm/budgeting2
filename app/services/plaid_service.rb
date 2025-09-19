class PlaidService < BaseService
  def initialize(account_id:, plaid_access_tokens: nil)
    @account = Account.find(account_id)
    @plaid_access_tokens = plaid_access_tokens
  end

  private def update_balance_for_account(plaid_sync_response:)
    begin
      plaid_sync_response.accounts.each do |plaid_api_account|
        Rails.logger.info "Updating balance for account #{plaid_api_account.id}"
        plaid_account = PlaidAccount.find_by(plaid_id: plaid_api_account.account_id, account_id: @account.id)
        next unless plaid_account
        current = plaid_api_account.balances.current&.to_f
        available = plaid_api_account.balances.available&.to_f
        limit = plaid_api_account.balances.limit&.to_f
        plaid_account.account_balances.create(
          current_balance: current,
          available_balance: available,
          limit: limit,
        )
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
      
      new_transaction = PlaidTransaction.new(
        account_id: @account.id,
        plaid_sync_event_id: plaid_sync_event.id,
        plaid_account_id: plaid_account.id,
        plaid_id: transaction.transaction_id,
        amount: transaction.amount,
        name: transaction.merchant_name || transaction.name,
        authorized_at: transaction.authorized_date,
        date: transaction.date,
        check_number: transaction.check_number,
        currency_code: transaction.iso_currency_code,
        pending: transaction.pending,
        plaid_category_primary: transaction.personal_finance_category.primary,
        plaid_category_detail: transaction.personal_finance_category.detailed,
        payment_channel: transaction.payment_channel,
        transaction_type: "expense",
      )

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
      existing_transaction.update(
        plaid_sync_event_id: plaid_sync_event.id,
        plaid_account_id: plaid_account&.id,
        plaid_id: transaction.transaction_id,
        amount: transaction.amount,
        name: transaction.merchant_name || transaction.name,
        authorized_at: transaction.authorized_date,
      )
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
    return merchant if merchant

    # lookup by name
    merchant = Merchant.find_by(merchant_name: transaction.merchant_name || transaction.name)
    return merchant if merchant

    # It does not exist, create it
    merchant = Merchant.create(
      account_id: @account.id,
      plaid_entity_id: plaid_entity_id,
      merchant_name: transaction.merchant_name || transaction.name,
    )

    return merchant
  end

  def api_client
    configuration = Plaid::Configuration.new
    configuration.server_index = Plaid::Configuration::Environment["production"]
    configuration.api_key["PLAID-CLIENT-ID"] = ENV["PLAID_CLIENT_ID"]
    configuration.api_key["PLAID-SECRET"] = ENV["PLAID_SECRET_PRODUCTION"]

    api_client = Plaid::ApiClient.new(configuration)

    return Plaid::PlaidApi.new(api_client)
  end
end
