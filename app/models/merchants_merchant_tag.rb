class MerchantsMerchantTag < ApplicationRecord
  acts_as_paranoid

  belongs_to :merchant
  belongs_to :merchant_tag
  
  scope :active, -> { where(deleted_at: nil) }
end 
