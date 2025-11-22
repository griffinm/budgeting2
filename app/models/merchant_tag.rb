class MerchantTag < ApplicationRecord
  audited
  has_associated_audits

  belongs_to :account
  belongs_to :user
  belongs_to :parent_merchant_tag, class_name: 'MerchantTag', optional: true
  has_many :child_tags, class_name: 'MerchantTag', foreign_key: 'parent_merchant_tag_id'
  has_many :plaid_transactions

  validates :target_budget, { numericality: { greater_than_or_equal_to: 0 } }

  scope :active, -> { where(deleted_at: nil) }
  scope :leaf, -> { where(is_leaf: true) }
  scope :non_leaf, -> { where(is_leaf: false) }

  before_create :initialize_color
  before_save :set_is_leaf
  before_save :validate_target_budget

  def is_leaf?
    self.is_leaf
  end

  def can_have_target_budget?
    is_leaf?
  end

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

  private def validate_target_budget
    if !can_have_target_budget?
      self.target_budget = nil
    end
  end

  private def set_is_leaf
    if self.child_tags.present?
      self.is_leaf = false
    else
      self.is_leaf = true
    end
  end
end 
