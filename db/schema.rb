# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_21_154422) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "dblink"
  enable_extension "pg_catalog.plpgsql"

  create_table "account_balances", force: :cascade do |t|
    t.bigint "plaid_account_id", null: false
    t.decimal "current_balance", null: false
    t.decimal "available_balance", null: false
    t.decimal "limit"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plaid_account_id"], name: "index_account_balances_on_plaid_account_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "audits", force: :cascade do |t|
    t.integer "auditable_id"
    t.string "auditable_type"
    t.integer "associated_id"
    t.string "associated_type"
    t.integer "user_id"
    t.string "user_type"
    t.string "username"
    t.string "action"
    t.text "audited_changes"
    t.integer "version", default: 0
    t.string "comment"
    t.string "remote_address"
    t.string "request_uuid"
    t.datetime "created_at"
    t.index ["associated_type", "associated_id"], name: "associated_index"
    t.index ["auditable_type", "auditable_id", "version"], name: "auditable_index"
    t.index ["created_at"], name: "index_audits_on_created_at"
    t.index ["request_uuid"], name: "index_audits_on_request_uuid"
    t.index ["user_id", "user_type"], name: "user_index"
  end

  create_table "merchant_tags", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "user_id", null: false
    t.bigint "parent_merchant_tag_id"
    t.string "name", null: false
    t.string "color", null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_merchant_tags_on_account_id"
    t.index ["parent_merchant_tag_id"], name: "index_merchant_tags_on_parent_merchant_tag_id"
    t.index ["user_id"], name: "index_merchant_tags_on_user_id"
  end

  create_table "merchants", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "merchant_name", null: false
    t.string "logo_url"
    t.string "address"
    t.string "city"
    t.string "state"
    t.string "zip"
    t.string "custom_name"
    t.string "plaid_entity_id"
    t.string "website"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "default_transaction_type"
    t.integer "default_merchant_tag_id"
    t.string "plaid_category_primary"
    t.string "plaid_category_detail"
    t.string "plaid_category_confidence_level"
    t.string "plaid_categories", default: [], array: true
    t.string "phone_number"
    t.index ["account_id"], name: "index_merchants_on_account_id"
  end

  create_table "merchants_merchant_tags", force: :cascade do |t|
    t.bigint "merchant_id", null: false
    t.bigint "merchant_tag_id", null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["merchant_id"], name: "index_merchants_merchant_tags_on_merchant_id"
    t.index ["merchant_tag_id"], name: "index_merchants_merchant_tags_on_merchant_tag_id"
  end

  create_table "plaid_access_tokens", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "token", null: false
    t.string "next_cursor"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_plaid_access_tokens_on_account_id"
  end

  create_table "plaid_accounts", force: :cascade do |t|
    t.string "plaid_id", null: false
    t.bigint "account_id", null: false
    t.string "plaid_mask"
    t.string "plaid_name"
    t.string "plaid_official_name"
    t.string "plaid_type"
    t.string "plaid_subtype"
    t.string "plaid_institution_id"
    t.string "nickname"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "plaid_access_token_id"
    t.index ["account_id"], name: "index_plaid_accounts_on_account_id"
    t.index ["plaid_access_token_id"], name: "index_plaid_accounts_on_plaid_access_token_id"
  end

  create_table "plaid_accounts_users", force: :cascade do |t|
    t.bigint "plaid_account_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plaid_account_id"], name: "index_plaid_accounts_users_on_plaid_account_id"
    t.index ["user_id"], name: "index_plaid_accounts_users_on_user_id"
  end

  create_table "plaid_sync_events", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "plaid_access_token_id", null: false
    t.string "event_type", null: false
    t.datetime "started_at", null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "cursor"
    t.index ["account_id"], name: "index_plaid_sync_events_on_account_id"
    t.index ["plaid_access_token_id"], name: "index_plaid_sync_events_on_plaid_access_token_id"
  end

  create_table "plaid_transactions", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "plaid_sync_event_id"
    t.bigint "plaid_account_id", null: false
    t.bigint "merchant_id", null: false
    t.string "plaid_id", null: false
    t.float "amount"
    t.string "name"
    t.datetime "authorized_at"
    t.datetime "date"
    t.string "check_number"
    t.string "currency_code"
    t.boolean "pending"
    t.string "plaid_category_primary"
    t.string "plaid_category_detail"
    t.string "payment_channel"
    t.string "transaction_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "merchant_tag_id"
    t.text "note"
    t.boolean "recurring", default: false
    t.string "plaid_category_confidence_level"
    t.index ["account_id"], name: "index_plaid_transactions_on_account_id"
    t.index ["date"], name: "index_plaid_transactions_on_date"
    t.index ["merchant_id"], name: "index_plaid_transactions_on_merchant_id"
    t.index ["merchant_tag_id"], name: "index_plaid_transactions_on_merchant_tag_id"
    t.index ["plaid_account_id"], name: "index_plaid_transactions_on_plaid_account_id"
    t.index ["plaid_sync_event_id"], name: "index_plaid_transactions_on_plaid_sync_event_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.string "password_digest"
    t.bigint "account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "time_zone"
    t.index ["account_id"], name: "index_users_on_account_id"
  end

  add_foreign_key "account_balances", "plaid_accounts"
  add_foreign_key "merchant_tags", "accounts"
  add_foreign_key "merchant_tags", "merchant_tags", column: "parent_merchant_tag_id"
  add_foreign_key "merchant_tags", "users"
  add_foreign_key "merchants", "accounts"
  add_foreign_key "merchants", "merchant_tags", column: "default_merchant_tag_id"
  add_foreign_key "merchants_merchant_tags", "merchant_tags"
  add_foreign_key "merchants_merchant_tags", "merchants"
  add_foreign_key "plaid_access_tokens", "accounts"
  add_foreign_key "plaid_accounts", "accounts"
  add_foreign_key "plaid_accounts", "plaid_access_tokens"
  add_foreign_key "plaid_accounts_users", "plaid_accounts"
  add_foreign_key "plaid_accounts_users", "users"
  add_foreign_key "plaid_sync_events", "accounts"
  add_foreign_key "plaid_sync_events", "plaid_access_tokens"
  add_foreign_key "plaid_transactions", "accounts"
  add_foreign_key "plaid_transactions", "merchant_tags"
  add_foreign_key "plaid_transactions", "merchants"
  add_foreign_key "plaid_transactions", "plaid_accounts"
  add_foreign_key "plaid_transactions", "plaid_sync_events"
  add_foreign_key "users", "accounts"
end
