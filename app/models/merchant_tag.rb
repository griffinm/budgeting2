class MerchantTag < ApplicationRecord
  belongs_to :account
  belongs_to :user
  belongs_to :parent_merchant_tag, class_name: 'MerchantTag', optional: true
  has_many :child_tags, class_name: 'MerchantTag', foreign_key: 'parent_merchant_tag_id'
  has_many :plaid_transactions
  
  has_many :merchants_merchant_tags, dependent: :destroy
  has_many :merchants, through: :merchants_merchant_tags
  
  scope :active, -> { where(deleted_at: nil) }

  before_create :initialize_color

  def initialize_color
    self.color = SecureRandom.hex(3)
  end
end 
