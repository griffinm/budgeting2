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
  
  validates :transaction_type, presence: true, inclusion: { in: TRANSACTION_TYPES.values }
  validates :plaid_id,
    presence: true,
    uniqueness: { scope: :account_id, message: "Transaction already exists" }
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

  def self.monthly_average_by_type(transaction_type, months_back = 1)
    
    if !TRANSACTION_TYPES.key?(transaction_type.to_sym)
      raise "Invalid transaction type: #{transaction_type}"
    end

    monthly_averages = []
    current_month_back = 0
    while current_month_back < months_back
      start_date = Date.current.beginning_of_month - current_month_back.months
      end_date = start_date - 1.month
      current_month_back += 1

      transactions = where(transaction_type: TRANSACTION_TYPES[transaction_type.to_sym])
        .where(account_id: account_id)
        .where(date: start_date..end_date)
        .not_pending
        .pluck(:amount)

      return 0 if transactions.empty?
      
      monthly_average = (transactions.sum / transactions.length.to_f).round(2)
      monthly_averages << monthly_average
    end

    monthly_averages.reduce(:+) / monthly_averages.length.to_f
  end
end 
