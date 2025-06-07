class Merchant < ApplicationRecord
  belongs_to :account
  has_many :merchants_merchant_tags, dependent: :destroy
  has_many :merchant_tags, through: :merchants_merchant_tags
  
  def full_address
    [address, city, state, zip].compact.join(', ')
  end
end 
