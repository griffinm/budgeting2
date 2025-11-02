class MerchantTag < ApplicationRecord
  belongs_to :account
  belongs_to :user
  belongs_to :parent_merchant_tag, class_name: 'MerchantTag', optional: true
  has_many :child_tags, class_name: 'MerchantTag', foreign_key: 'parent_merchant_tag_id'
  has_many :plaid_transactions
  
  scope :active, -> { where(deleted_at: nil) }

  before_create :initialize_color

  def initialize_color
    self.color = SecureRandom.hex(3)
  end

  def parent_ids
    parent_ids = []
    current_tag = self
    while current_tag.parent_merchant_tag_id.present?
      parent_ids << current_tag.parent_merchant_tag_id
      current_tag = current_tag.parent_merchant_tag
    end
    parent_ids
  end

  def child_ids
    child_ids = [id]
    child_tags.each do |tag|
      child_ids.concat(tag.child_ids)
      if tag.child_tags.present?
        child_ids.concat(tag.child_tags.pluck(:id))
      end
    end
    child_ids.uniq
  end
end 
