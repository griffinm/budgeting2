class MerchantDefaultTag < ApplicationRecord
  belongs_to :merchant
  belongs_to :tag
  belongs_to :user

  validates :tag_id, uniqueness: { scope: :merchant_id }
end
