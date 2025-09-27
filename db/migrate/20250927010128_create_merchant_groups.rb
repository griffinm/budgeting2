class CreateMerchantGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :merchant_groups do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.references :primary_merchant, null: false, foreign_key: { to_table: :merchants }

      t.timestamps
      
      t.index [:account_id, :name], unique: true
    end
  end
end
