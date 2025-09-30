class PlaidAccountsUser < ApplicationRecord
  belongs_to :plaid_account
  belongs_to :user
  has_many :account_balances, dependent: :destroy
end
