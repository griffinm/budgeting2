class PlaidTransaction < ApplicationRecord
  audited

  TRANSACTION_TYPES = {
    expense: 'expense',
    income: 'income',
    transfer: 'transfer'
  }

  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant
  belongs_to :merchant_tag, optional: true
  
  validates :transaction_type, presence: true, inclusion: { in: TRANSACTION_TYPES.keys }
  validates :plaid_id, presence: true, uniqueness: { scope: :account_id }

  before_create :set_default_categories

  scope :not_pending, -> { where(pending: false) }
  scope :expense, -> { where(transaction_type: TRANSACTION_TYPES[:expense]) }
  scope :income, -> { where(transaction_type: TRANSACTION_TYPES[:income]) }
  scope :transfer, -> { where(transaction_type: TRANSACTION_TYPES[:transfer]) }
  scope :in_month, -> (month, year) { where(date: Date.new(year, month, 1)..Date.new(year, month, -1)) }

  def self.base_query_for_api(account_id)
    joins(:plaid_account, :merchant)
      .includes(:plaid_account, :merchant_tag, merchant: [:default_merchant_tag])
      .where(plaid_transactions: { account_id: account_id })
      .order(date: :desc)
  end

  def has_default_merchant_tag?
    return false if self.merchant_tag_id.blank?
    self.merchant_tag_id == self.merchant.default_merchant_tag_id
  end

  def set_default_categories
    self.merchant_tag_id = self.merchant.default_merchant_tag_id if self.merchant.default_merchant_tag_id.present?
    self.transaction_type = self.merchant.default_transaction_type if self.merchant.default_transaction_type.present?
  end
end 
