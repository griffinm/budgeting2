class Account < ApplicationRecord
  audited
  
  has_many :users
  has_many :plaid_access_tokens, dependent: :destroy
  has_many :plaid_sync_events, dependent: :destroy
  has_many :plaid_accounts, dependent: :destroy
  has_many :plaid_transactions, dependent: :destroy
  has_many :merchants, dependent: :destroy
  has_many :merchant_tags, dependent: :destroy
  has_many :merchant_groups, dependent: :destroy
  has_many :account_balances, through: :plaid_accounts

  scope :demo_accounts, -> { where(is_demo: true) }
  scope :live_accounts, -> { where(is_demo: false) }
end
