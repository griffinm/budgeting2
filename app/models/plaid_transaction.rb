class PlaidTransaction < ApplicationRecord
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

  def is_check?
    self.check_number.present?
  end

  def has_default_merchant_tag?
    return false if self.merchant_tag_id.blank?
    self.merchant_tag_id == self.merchant.default_merchant_tag_id
  end

  def set_default_categories
    self.merchant_tag_id = self.merchant.default_merchant_tag_id if self.merchant.default_merchant_tag_id.present?
    self.transaction_type = self.merchant.default_transaction_type if self.merchant.default_transaction_type.present?

    if self.transaction_type.blank?
      # Infer the transaction type based on the amount
      if self.amount < 0
        # negative amount is income, it's just the way plaid works
        self.transaction_type = 'income'
      else
        self.transaction_type = 'expense'
      end
    end
  end

  def self.parse_plaid_transaction(plaid_transaction, account, plaid_account, plaid_sync_event)
    date_string = plaid_transaction.datetime || plaid_transaction.date
    date_obj = plaid_transaction.datetime.present? ? Time.iso8601(date_string) : date_string
    
    {
      account_id: account.id,
      plaid_sync_event_id: plaid_sync_event.id,
      plaid_account_id: plaid_account.id,
      plaid_id: plaid_transaction.transaction_id,
      amount: plaid_transaction.amount,
      name: plaid_transaction.merchant_name || plaid_transaction.name,
      authorized_at: plaid_transaction.authorized_date,
      date: date_obj,
      check_number: plaid_transaction.check_number,
      currency_code: plaid_transaction.iso_currency_code,
      pending: plaid_transaction.pending,
      payment_channel: plaid_transaction.payment_channel,
      transaction_type: "expense",
      plaid_category_primary: plaid_transaction.personal_finance_category.primary,
      plaid_category_detail: plaid_transaction.personal_finance_category.detailed,
      plaid_category_confidence_level: plaid_transaction.personal_finance_category.confidence_level,
      plaid_categories: plaid_transaction.category,
    }
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

  def self.get_transaction_date(plaid_transaction)
    if plaid_transaction.datetime.present?
      return Time.iso8601(plaid_transaction.datetime)
    else
      return Date.parse(plaid_transaction.date)
    end
  end

end 
