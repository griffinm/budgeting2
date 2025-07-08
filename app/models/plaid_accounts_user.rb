class PlaidAccountsUser < ApplicationRecord
  belongs_to :plaid_account
  belongs_to :user
end
