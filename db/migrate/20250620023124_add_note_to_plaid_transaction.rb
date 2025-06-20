class AddNoteToPlaidTransaction < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_transactions, :note, :text
  end
end
