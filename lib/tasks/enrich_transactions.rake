namespace :plaid do
  desc "Enrich all PlaidTransactions with additional data from Plaid API"
  task :enrich_transactions, [:force] => :environment do |t, args|
    force = args[:force] == 'true'
  Rails.logger.info "PlaidEnrichment: Starting transaction enrichment process"

  # Get all accounts that have PlaidTransactions
  accounts_with_transactions = Account.joins(:plaid_transactions).distinct
  Rails.logger.info "PlaidEnrichment: Found #{accounts_with_transactions.count} accounts with transactions"

  accounts_with_transactions.each do |account|
    Rails.logger.info "PlaidEnrichment: Enriching transactions for account #{account.id}"
    
    # Get all PlaidTransactions for this account that haven't been enriched yet
    # (or have missing enrichment data)
    if force
      transactions = account.plaid_transactions.includes(:merchant)
      Rails.logger.info "PlaidEnrichment: Force mode - enriching ALL transactions for account #{account.id}"
    else
      transactions = account.plaid_transactions.includes(:merchant)
                            .where(plaid_category_primary: [nil, ""])
    end
    Rails.logger.info "PlaidEnrichment: Found #{transactions.count} transactions needing enrichment for account #{account.id}"
    
    next if transactions.empty?
    
    # Process transactions in batches of 99 (Plaid API limit)
    transactions.find_in_batches(batch_size: 99) do |transaction_batch|
      Rails.logger.info "PlaidEnrichment: Processing batch of #{transaction_batch.count} transactions for account #{account.id}"
      
      begin
        # Initialize PlaidService for this account
        plaid_service = PlaidService.new(account_id: account.id)
        
        # Convert PlaidTransaction objects to the format expected by enrich_transactions
        # The enrich_transactions method expects Plaid API transaction objects
        plaid_transaction_objects = transaction_batch.map do |transaction|
          # Create a mock object that mimics the Plaid API transaction structure
          OpenStruct.new(
            transaction_id: transaction.plaid_id,
            amount: transaction.amount,
            merchant_name: transaction.name,
            name: transaction.name,
            iso_currency_code: transaction.currency_code
          )
        end
        
        # Call the enrichment method directly to avoid the bug in the service method
        enrich_transactions_batch(plaid_service, transaction_batch, plaid_transaction_objects)
        
        Rails.logger.info "PlaidEnrichment: Successfully enriched batch for account #{account.id}"
        
      rescue => exception
        Rails.logger.error "PlaidEnrichment: Error enriching transactions for account #{account.id}: #{exception.message}"
        Rails.logger.error exception.backtrace.join("\n")
      end
    end
    
    Rails.logger.info "PlaidEnrichment: Completed enrichment for account #{account.id}"
  end

  Rails.logger.info "PlaidEnrichment: Transaction enrichment process completed"
  end
end

# Helper method to properly enrich a batch of transactions
# This fixes the bug in PlaidService#enrich_transactions where it was making
# an API call for each transaction instead of batching them
def enrich_transactions_batch(plaid_service, db_transactions, plaid_transaction_objects)
  Rails.logger.info "Enriching #{plaid_transaction_objects.count} transactions"
  
  begin
    # Create the enrichment request with all transactions in the batch
    enrich_request = Plaid::TransactionsEnrichRequest.new(
      account_type: "depository",
      transactions: plaid_transaction_objects.map do |transaction|
        {
          id: transaction.transaction_id,
          amount: transaction.amount.abs,
          description: transaction.merchant_name || transaction.name,
          iso_currency_code: transaction.iso_currency_code,
          direction: transaction.amount > 0 ? "OUTFLOW" : "INFLOW",
        }
      end
    )
    
    # Make the API call
    result = plaid_service.send(:api_client).transactions_enrich(enrich_request)

    # Process the enriched results
    result.enriched_transactions.each do |enriched_transaction|
      enrichments = enriched_transaction.enrichments
      transaction = PlaidTransaction.find_by(plaid_id: enriched_transaction.id)
      next unless transaction

      begin
        transaction.update(
          plaid_category_primary: enrichments.personal_finance_category.primary,
          plaid_category_detail: enrichments.personal_finance_category.detailed,
          plaid_category_confidence_level: enrichments.personal_finance_category.confidence_level,
          recurring: enrichments.recurrence.is_recurring,
        )
        
        if transaction.merchant
          transaction.merchant.update(
            plaid_category_primary: enrichments.personal_finance_category.primary,
            plaid_category_detail: enrichments.personal_finance_category.detailed,
            plaid_category_confidence_level: enrichments.personal_finance_category.confidence_level,
            phone_number: enrichments.phone_number,
            website: enrichments.website,
            logo_url: enrichments.logo_url,
          )
        end
      rescue => exception
        Rails.logger.error "Error updating transaction #{transaction.id}: #{exception.message}"
        Rails.logger.error exception.backtrace.join("\n")
      end
    end
    
  rescue => exception
    Rails.logger.error "Error enriching transaction batch: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    raise
  end
end
