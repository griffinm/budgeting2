class PlaidAccessToken < ApplicationRecord
  belongs_to :account
  has_many :plaid_sync_events, dependent: :destroy
end 
