class CreateMerchantDefaultTags < ActiveRecord::Migration[8.0]
  def change
    create_table :merchant_default_tags do |t|
      t.references :merchant, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :merchant_default_tags, [:merchant_id, :tag_id], unique: true
  end
end
