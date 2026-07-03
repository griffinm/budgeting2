class AddClassificationSourceToPlaidTransactions < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_transactions, :classification_source, :string
  end
end
