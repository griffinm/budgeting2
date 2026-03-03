class Tag < ApplicationRecord
  acts_as_paranoid

  has_many :tag_plaid_transactions
  has_many :plaid_transactions, through: :tag_plaid_transactions
  belongs_to :user
  belongs_to :account
end