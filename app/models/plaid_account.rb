class PlaidAccount < ApplicationRecord
  acts_as_paranoid

  belongs_to :account
  belongs_to :user
  has_many :plaid_transactions, dependent: :destroy
  
  validates :plaid_id, presence: true, uniqueness: { scope: :account_id }

  scope :active, -> { where(deleted_at: nil) }
end 
