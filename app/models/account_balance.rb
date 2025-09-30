class AccountBalance < ApplicationRecord
  belongs_to :plaid_accounts_user
  has_one :plaid_account, through: :plaid_accounts_user
  has_one :user, through: :plaid_accounts_user
  has_one :account, through: :plaid_account

  validates :current_balance, :available_balance, presence: true
  validates :limit, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }

  scope :current, -> { order(created_at: :desc).first }
  
  # Get the most recent account balance for each plaid_account using pure Active Record
  scope :latest_per_account, -> {
    where(id: select('MAX(account_balances.id)').group(:plaid_accounts_user_id))
  }
end
