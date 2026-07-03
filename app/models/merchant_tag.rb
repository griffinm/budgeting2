class MerchantTag < ApplicationRecord
  audited
  has_associated_audits

  belongs_to :account
  belongs_to :user
  belongs_to :parent_merchant_tag, class_name: 'MerchantTag', optional: true
  has_many :child_tags, class_name: 'MerchantTag', foreign_key: 'parent_merchant_tag_id'
  has_many :plaid_transactions

  validates :target_budget, { numericality: { greater_than_or_equal_to: 0 }, allow_nil: true }

  scope :active, -> { where(deleted_at: nil) }
  scope :leaf, -> { where(is_leaf: true) }
  scope :non_leaf, -> { where(is_leaf: false) }

  before_create :initialize_color
  before_save :set_is_leaf
  before_save :validate_target_budget
  after_save :sync_parent_leafness
  before_destroy :detach_dependents
  after_destroy :sync_parent_leafness_after_destroy

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

  # set_is_leaf only runs when a tag itself is saved, so gaining or losing a
  # child must explicitly re-save the affected parents.
  private def sync_parent_leafness
    return unless saved_change_to_parent_merchant_tag_id?

    old_parent_id, new_parent_id = saved_change_to_parent_merchant_tag_id
    [old_parent_id, new_parent_id].compact.uniq.each do |parent_id|
      MerchantTag.find_by(id: parent_id)&.save!
    end
  end

  # Children, transactions, and merchants all hold FK references to this tag;
  # detach them so destroy doesn't raise. Children are promoted one level up.
  private def detach_dependents
    child_tags.update_all(parent_merchant_tag_id: parent_merchant_tag_id)
    plaid_transactions.update_all(merchant_tag_id: nil)
    Merchant.where(default_merchant_tag_id: id).update_all(default_merchant_tag_id: nil)
  end

  private def sync_parent_leafness_after_destroy
    MerchantTag.find_by(id: parent_merchant_tag_id)&.save!
  end
end
