class PlaidAccessToken < ApplicationRecord
  belongs_to :account
  has_many :plaid_accounts, dependent: :destroy
end 
