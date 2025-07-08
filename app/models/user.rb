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

  def as_json
    {
      id: id,
      email: email,
      first_name: first_name,
      last_name: last_name,
      account_id: account_id
    }
  end
end
