class AddPlaidCategoriesToMerchant < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :plaid_category_primary, :string
    add_column :merchants, :plaid_category_detail, :string
    add_column :merchants, :plaid_category_confidence_level, :string
    add_column :merchants, :plaid_categories, :string, array: true, default: []
  end
end
