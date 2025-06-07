task import_transactions: :environment do
  puts "Importing transactions"

  old_transactions = <<-SQL
    SELECT *
      FROM dblink('dbname=old_budgeting user=griffin',
                  'SELECT 
                    id,
                    connected_account_id,
                    account_id,
                    amount,
                    name,
                    "authorizedDate",
                    "checkNumber",
                    "currencyCode",
                    pending,
                    plaid_category_primary,
                    plaid_category_detail,
                    date,
                    "merchantId",
                    payment_channel,
                    sync_event_id,
                    created_at,
                    updated_at

                  FROM account_transactions'
            )

      AS connected_accounts(
        id TEXT,
        connected_account_id TEXT,
        account_id TEXT,
        amount TEXT,
        name TEXT,
        authorized_date TEXT,
        check_number TEXT,
        currency_code TEXT,
        pending TEXT,
        plaid_category_primary TEXT,
        plaid_category_detail TEXT,
        date TEXT,
        merchant_id TEXT,
        payment_channel TEXT,
        sync_event_id TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      );
  SQL

  # execute the query
  transactions = ActiveRecord::Base.connection.execute(old_transactions)
  puts "Importing #{transactions.count} transactions"
  account = Account.first

  # Create a dummy sync event
  plaid_sync_event = PlaidSyncEvent.create!(
    account: account,
    plaid_access_token: PlaidAccessToken.first,
    event_type: "sync",
    started_at: Time.now,
    completed_at: Time.now,
  )

  transactions.each do |transaction|
    old_id = transaction["connected_account_id"]
    plaid_account = PlaidAccount.find_by(plaid_id: transaction["connected_account_id"])

    old_merchant_name = transaction["name"]
    merchant = Merchant.find_by(merchant_name: old_merchant_name)

    if merchant.nil?
      puts "Merchant not found for transaction #{transaction["id"]}, creating #{old_merchant_name}"
      merchant = Merchant.create!(
        merchant_name: old_merchant_name,
        account: account,
      )
    end

    PlaidTransaction.create!(
      account: account,
      plaid_account: plaid_account,
      plaid_id: transaction["id"],
      amount: transaction["amount"],
      name: transaction["name"],
      authorized_at: transaction["authorized_date"],
      check_number: transaction["check_number"],
      currency_code: transaction["currency_code"],
      pending: transaction["pending"],
      plaid_category_primary: transaction["plaid_category_primary"],
      plaid_category_detail: transaction["plaid_category_detail"],
      date: transaction["date"],
      merchant: merchant,
      payment_channel: transaction["payment_channel"],
      plaid_sync_event: plaid_sync_event
    )
  end

  puts "Done importing transactions"
end
