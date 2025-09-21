class User < ApplicationRecord
  has_secure_password
  belongs_to :account
  has_many :plaid_accounts_users, dependent: :destroy
  has_many :plaid_accounts, through: :plaid_accounts_users
  has_many :merchant_tags, dependent: :destroy
  has_many :plaid_transactions, through: :plaid_accounts
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :password, length: { minimum: 8 }, allow_nil: true
  before_save :apply_defaults

  private def apply_defaults
    if(self.time_zone.blank?)
      self.time_zone = 'Eastern Time (US & Canada)'
    end
  end

  def as_json(options = {})
    super(options).merge({
      id: id,
      email: email,
      firstName: first_name,
      lastName: last_name,
      accountId: account_id
    })
  end
end
