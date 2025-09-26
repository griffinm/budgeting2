class AddCategoriesToPlaidTransactions < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_transactions, :plaid_categories, :string
  end
end
