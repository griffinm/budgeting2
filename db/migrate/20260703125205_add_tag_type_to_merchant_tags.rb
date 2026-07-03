class AddTagTypeToMerchantTags < ActiveRecord::Migration[8.0]
  def change
    add_column :merchant_tags, :tag_type, :string, null: false, default: 'expense'
  end
end
