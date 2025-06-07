class PlaidAccount < ApplicationRecord
  acts_as_paranoid

  belongs_to :account
  belongs_to :user
  has_many :plaid_transactions, dependent: :destroy
  
  scope :active, -> { where(deleted_at: nil) }
end 
