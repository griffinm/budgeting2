class DropMerchantsMerchantTag < ActiveRecord::Migration[8.0]
  def change
    drop_table :merchants_merchant_tags
  end
end
