class PlaidTransaction < ApplicationRecord
  audited

  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant
  belongs_to :merchant_tag, optional: true
  
  validates :transaction_type, presence: true, inclusion: { in: ['expense', 'income', 'transfer'] }
  validates :plaid_id, presence: true, uniqueness: { scope: :account_id }

  before_create :set_default_categories

  def has_default_merchant_tag?
    return false if self.merchant_tag_id.blank?
    self.merchant_tag_id == self.merchant.default_merchant_tag_id
  end

  def set_default_categories
    self.merchant_tag_id = self.merchant.default_merchant_tag_id if self.merchant.default_merchant_tag_id.present?
    self.transaction_type = self.merchant.default_transaction_type if self.merchant.default_transaction_type.present?
  end
end 
