class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :plaid_access_tokens do |t|
      t.references :account, null: false, foreign_key: true
      t.string :token, null: false
      t.string :next_cursor

      t.timestamps
    end

    create_table :plaid_sync_events do |t|
      t.references :account, null: false, foreign_key: true
      t.references :plaid_access_token, null: false, foreign_key: true
      t.string :event_type, null: false
      t.datetime :started_at, null: false
      t.datetime :completed_at

      t.timestamps
    end

    create_table :plaid_accounts do |t|
      t.string :plaid_id, null: false
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :plaid_mask
      t.string :plaid_name
      t.string :plaid_official_name
      t.string :plaid_type
      t.string :plaid_subtype
      t.string :plaid_institution_id
      t.string :nickname
      t.datetime :deleted_at

      t.timestamps
    end

    create_table :merchants do |t|
      t.references :account, null: false, foreign_key: true
      t.string :merchant_name, null: false
      t.string :logo_url
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :custom_name
      t.string :plaid_entity_id
      t.string :website

      t.timestamps
    end

    create_table :merchant_tags do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :parent_merchant_tag, foreign_key: { to_table: :merchant_tags }
      t.string :name, null: false
      t.string :color, null: false
      t.datetime :deleted_at

      t.timestamps
    end

    create_table :merchants_merchant_tags do |t|
      t.references :merchant, null: false, foreign_key: true
      t.references :merchant_tag, null: false, foreign_key: true
      t.datetime :deleted_at

      t.timestamps
    end


    create_table :plaid_transactions do |t|
      t.references :account, null: false, foreign_key: true
      t.references :plaid_sync_event, foreign_key: true, null: true
      t.references :plaid_account, null: false, foreign_key: true
      t.references :merchant, null: false, foreign_key: true
      t.string :plaid_id, null: false
      t.float :amount
      t.string :name
      t.datetime :authorized_at
      t.datetime :date
      t.string :check_number
      t.string :currency_code
      t.boolean :pending
      t.string :plaid_category_primary
      t.string :plaid_category_detail
      t.string :payment_channel
      t.string :transaction_type

      t.timestamps
    end
  end
end
