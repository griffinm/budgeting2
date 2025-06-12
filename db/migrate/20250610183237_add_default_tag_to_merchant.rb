class AddDefaultTagToMerchant < ActiveRecord::Migration[8.0]
  def change
    add_column :merchants, :default_merchant_tag_id, :integer, null: true
    add_foreign_key :merchants, :merchant_tags, column: :default_merchant_tag_id
  end
end
