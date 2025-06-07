class PlaidSyncEvent < ApplicationRecord
  belongs_to :account
  belongs_to :plaid_access_token
  has_many :plaid_transactions, dependent: :destroy
end 
