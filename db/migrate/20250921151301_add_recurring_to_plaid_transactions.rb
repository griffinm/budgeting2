class AddRecurringToPlaidTransactions < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_transactions, :recurring, :boolean, default: false
  end
end
