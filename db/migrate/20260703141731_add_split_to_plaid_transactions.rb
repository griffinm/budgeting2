class AddSplitToPlaidTransactions < ActiveRecord::Migration[8.0]
  def change
    add_reference :plaid_transactions, :parent_plaid_transaction,
      foreign_key: { to_table: :plaid_transactions, on_delete: :cascade },
      index: true, null: true
    add_column :plaid_transactions, :split, :boolean, default: false, null: false
  end
end
