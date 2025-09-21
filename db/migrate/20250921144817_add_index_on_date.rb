class AddIndexOnDate < ActiveRecord::Migration[8.0]
  def change
    add_index :plaid_transactions, :date
  end
end
