class AddIsLeafToMerchantTag < ActiveRecord::Migration[8.0]
  def up
    add_column :merchant_tags, :is_leaf, :boolean, default: false
  
    MerchantTag.all.each do |merchant_tag|
      merchant_tag.update(is_leaf: merchant_tag.child_tags.empty?)
    end
  end

  def down
    remove_column :merchant_tags, :is_leaf
  end
end
