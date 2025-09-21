class AddMissingPlaidFields < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :phone_number, :string
    add_column :plaid_transactions, :plaid_category_confidence_level, :string
  end
end
