class PlaidSyncEvent < ApplicationRecord
  belongs_to :account
  belongs_to :plaid_access_token
  has_many :plaid_transactions

  validates :cursor,
    presence: true,
    allow_blank: true
  validates :event_type, presence: true, inclusion: { in: ["STARTED", "COMPLETED", "ERROR"] }
  validates :started_at, presence: true
  validates :account_id, presence: true
  validates :plaid_access_token_id, presence: true
end 
