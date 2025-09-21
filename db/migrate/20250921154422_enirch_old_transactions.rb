class EnirchOldTransactions < ActiveRecord::Migration[8.0]
  def change
    Account.all.each do |account|
      plaid_service = PlaidService.new(account_id: account.id)
      # Loop through all transactions 20 at a time
      account.plaid_transactions.each_slice(20) do |transactions|
        plaid_service.enrich_transactions(transactions: transactions)
      end

    end
  end
end
