class MerchantGroupMembership < ApplicationRecord
  belongs_to :merchant_group
  belongs_to :merchant

  validates :merchant_id, uniqueness: { scope: :merchant_group_id }
end
