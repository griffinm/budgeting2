class CreateMerchantGroupMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :merchant_group_memberships do |t|
      t.references :merchant_group, null: false, foreign_key: true
      t.references :merchant, null: false, foreign_key: true
      t.boolean :is_primary, default: false

      t.timestamps
      
      t.index [:merchant_group_id, :merchant_id], unique: true, name: 'index_merchant_group_memberships_unique'
    end
  end
end
