class User < ApplicationRecord
  has_secure_password
  belongs_to :account
  has_many :plaid_accounts, dependent: :destroy
  has_many :merchant_tags, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :password, presence: true, length: { minimum: 8 }

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
