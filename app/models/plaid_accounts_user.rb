class PlaidAccountsUser < ApplicationRecord
  belongs_to :plaid_account
  belongs_to :user
  has_many :account_balances, dependent: :destroy

  validates :user_id, uniqueness: { scope: :plaid_account_id }
end
