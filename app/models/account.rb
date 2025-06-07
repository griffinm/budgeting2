class Account < ApplicationRecord
  has_many :users
  has_many :plaid_access_tokens, dependent: :destroy
  has_many :plaid_sync_events, dependent: :destroy
  has_many :plaid_accounts, dependent: :destroy
  has_many :plaid_transactions, dependent: :destroy
  has_many :merchants, dependent: :destroy
  has_many :merchant_tags, dependent: :destroy
end
