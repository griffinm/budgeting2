class PlaidAccount < ApplicationRecord
  acts_as_paranoid
  audited

  ACCOUNT_TYPES = {
    deposit: 'deposit',
    credit: 'credit',
    loan: 'loan',
    investment: 'investment'
  }.freeze
  
  # Translations from Plaid API to our own types
  DEPOSIT_ACCOUNT_TYPES = %w[checking savings depository savings].freeze
  CREDIT_ACCOUNT_TYPES = ['credit', 'credit_card', 'credit card'].freeze
  LOAN_ACCOUNT_TYPES = %w[loan].freeze
  INVESTMENT_ACCOUNT_TYPES = %w[investment].freeze
  
  belongs_to :account
  has_many :plaid_accounts_users, dependent: :destroy
  has_many :users, through: :plaid_accounts_users
  has_many :plaid_transactions, dependent: :destroy
  belongs_to :plaid_access_token, dependent: :destroy
  has_many :account_balances, through: :plaid_accounts_users

  validates :plaid_id, presence: true, uniqueness: { scope: :account_id }

  scope :active, -> { where(deleted_at: nil) }
  # Archived = user closed the real bank account. History stays visible but the
  # account is skipped by all Plaid syncing. Distinct from paranoia's deleted_at,
  # which hides the record entirely.
  scope :not_archived, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil) }

  def self.types_for_category(category)
    case category
    when 'deposit'
      DEPOSIT_ACCOUNT_TYPES
    when 'credit'
      CREDIT_ACCOUNT_TYPES
    when 'loan'
      LOAN_ACCOUNT_TYPES
    when 'investment'
      INVESTMENT_ACCOUNT_TYPES
    else
      []
    end
  end

  def account_type
    case plaid_type
    when *DEPOSIT_ACCOUNT_TYPES
      ACCOUNT_TYPES[:deposit]
    when *CREDIT_ACCOUNT_TYPES
      ACCOUNT_TYPES[:credit]
    when *LOAN_ACCOUNT_TYPES
      ACCOUNT_TYPES[:loan]
    when *INVESTMENT_ACCOUNT_TYPES
      ACCOUNT_TYPES[:investment]
    else
      nil
    end
  end

  def archived?
    archived_at.present?
  end

  # Virtual attribute so the API can toggle with archived: true/false.
  # Re-archiving an already-archived account preserves the original timestamp.
  def archived=(value)
    self.archived_at = ActiveModel::Type::Boolean.new.cast(value) ? (archived_at || Time.current) : nil
  end

  def current_balance
    account_balances.current
  end

  def pick_name
    nickname || plaid_official_name
  end
end 
