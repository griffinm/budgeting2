class PlaidTransaction < ApplicationRecord
  audited

  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant
  belongs_to :merchant_tag, optional: true
  
  validates :transaction_type, presence: true, inclusion: { in: ['expense', 'income', 'transfer'] }

  before_create :set_default_categories

  def set_default_categories
    self.is_expense = self.merchant.default_is_expense
    self.is_transfer = self.merchant.default_is_transfer
  end
end 
