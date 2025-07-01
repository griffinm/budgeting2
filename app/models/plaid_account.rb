class PlaidAccount < ApplicationRecord
  acts_as_paranoid

  belongs_to :account
  belongs_to :user
  has_many :plaid_transactions, dependent: :destroy
  belongs_to :plaid_access_token, dependent: :destroy
  has_many :account_balances, dependent: :destroy

  validates :plaid_id, presence: true, uniqueness: { scope: :account_id }

  scope :active, -> { where(deleted_at: nil) }

  def current_balance
    account_balances.current
  end

  def pick_name
    nickname || plaid_official_name
  end
end 
