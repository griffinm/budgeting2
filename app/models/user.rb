class User < ApplicationRecord
  has_secure_password
  belongs_to :account
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :password, presence: true, length: { minimum: 8 }
end
