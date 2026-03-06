class CreateTag < ActiveRecord::Migration[8.0]
  def change
    create_table :tags do |t|
      t.string :name
      t.references :account
      t.references :user
      t.datetime :deleted_at
      t.timestamps
    end

    create_table :tag_plaid_transactions do |t|
      t.references :tag
      t.references :plaid_transaction
      t.references :user
      t.timestamps
    end
  end
end
