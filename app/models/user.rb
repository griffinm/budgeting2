class User < ApplicationRecord
  has_secure_password
  audited except: [:password_digest]

  belongs_to :account
  has_many :plaid_accounts_users, dependent: :destroy
  has_many :plaid_accounts, through: :plaid_accounts_users
  has_many :merchant_tags, dependent: :destroy
  has_many :plaid_transactions, through: :plaid_accounts
  has_many :account_balances, through: :plaid_accounts_users
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :password, length: { minimum: 8 }, allow_nil: true
  validates :report_frequency, inclusion: { in: %w[daily weekly monthly] }
  validates :report_day_of_week, inclusion: { in: 0..6 }, allow_nil: true
  validates :report_day_of_week, presence: true, if: -> { report_enabled? && report_frequency.in?(%w[weekly monthly]) }
  before_save :apply_defaults

  private def apply_defaults
    if(self.time_zone.blank?)
      self.time_zone = 'Eastern Time (US & Canada)'
    end
  end

  def as_json(options = {})
    {
      id: id,
      email: email,
      firstName: first_name,
      lastName: last_name,
      accountId: account_id,
      createdAt: created_at,
      linkedAccounts: plaid_accounts.count,
      reportEnabled: report_enabled,
      reportFrequency: report_frequency,
      reportDayOfWeek: report_day_of_week,
    }
  end
end
