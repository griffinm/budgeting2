class PlaidTransaction < ApplicationRecord
  TRANSACTION_TYPES = {
    expense: 'expense',
    income: 'income',
    transfer: 'transfer'
  }

  CLASSIFICATION_SOURCES = %w[merchant_default category_default plaid_category sign_inference user].freeze

  belongs_to :account
  belongs_to :plaid_sync_event
  belongs_to :plaid_account
  belongs_to :merchant
  belongs_to :merchant_tag, optional: true
  belongs_to :recurring_stream, optional: true
  belongs_to :parent_transaction, class_name: 'PlaidTransaction',
    foreign_key: 'parent_plaid_transaction_id', optional: true
  has_many :child_transactions, class_name: 'PlaidTransaction',
    foreign_key: 'parent_plaid_transaction_id', dependent: :destroy
  has_many :tag_plaid_transactions
  has_many :tags, through: :tag_plaid_transactions

  validates :transaction_type, presence: true, inclusion: { in: TRANSACTION_TYPES.values }
  validate :no_nested_splits
  validates :classification_source, inclusion: { in: CLASSIFICATION_SOURCES }, allow_nil: true
  validates :plaid_id,
    presence: true,
    uniqueness: { scope: :account_id, message: "Transaction already exists" }
  # before_validation (not before_create) so the type is set before the
  # presence validation runs — synced transactions arrive with no type.
  # Skipped for split children: their category/type are chosen by the user
  # at split time and must not be clobbered by merchant defaults.
  before_validation :set_default_categories, on: :create, unless: :split_child?
  after_create :apply_merchant_default_tags

  scope :not_pending, -> { where(pending: false) }
  scope :not_split_parent, -> { where(split: false) }
  scope :expense, -> { where(transaction_type: TRANSACTION_TYPES[:expense]) }
  scope :income, -> { where(transaction_type: TRANSACTION_TYPES[:income]) }
  scope :transfer, -> { where(transaction_type: TRANSACTION_TYPES[:transfer]) }
  scope :in_month, -> (month, year) { where(date: Date.new(year, month, 1)..Date.new(year, month, -1)) }

  # Canonical aggregation convention (raw-SQL services replicate this inline):
  #   spend  = SUM(amount) over expense rows  (positive; refunds net out)
  #   income = -SUM(amount) over income rows  (positive; Plaid stores income negative)
  #   transfers are excluded from both, everywhere.
  def self.spend_total
    expense.not_split_parent.sum(:amount)
  end

  def self.income_total
    -income.not_split_parent.sum(:amount)
  end

  # Split parents are NOT excluded here — show pages need them. Callers that
  # aggregate over this query must add .not_split_parent themselves.
  def self.base_query_for_api(account_id)
    joins(:plaid_account, :merchant)
      .includes(:plaid_account, :merchant_tag, tag_plaid_transactions: :tag, merchant: [:default_merchant_tag])
      .where(plaid_transactions: { account_id: account_id })
      .order(date: :desc)
  end

  def split_child?
    parent_plaid_transaction_id.present?
  end

  def is_check?
    self.check_number.present?
  end

  def has_default_merchant_tag?
    return false if self.merchant_tag_id.blank?
    self.merchant_tag_id == self.merchant.default_merchant_tag_id
  end

  def set_default_categories
    return if merchant.nil?

    default_category = merchant.default_merchant_tag_id
    default_type = merchant.default_transaction_type

    # Fall back to group merchant defaults if this merchant doesn't have its own
    if merchant.merchant_group && (default_category.blank? || default_type.blank?)
      merchant.merchant_group.merchants.each do |group_merchant|
        default_category ||= group_merchant.default_merchant_tag_id
        default_type ||= group_merchant.default_transaction_type
        break if default_category.present? && default_type.present?
      end
    end

    self.merchant_tag_id = default_category if default_category.present?

    # An explicitly assigned type (imports, console, specs) always wins
    return if transaction_type.present?

    if default_type.present?
      self.transaction_type = default_type
      self.classification_source = 'merchant_default'
    elsif default_category.present? && (category_type = MerchantTag.where(id: default_category).pick(:tag_type))
      # Category drives type: the default category types the transaction.
      # Explicit merchant defaults still win, and this deliberately precedes
      # Plaid's transfer detection — set default_transaction_type = 'transfer'
      # on the merchant to route around it.
      self.transaction_type = category_type
      self.classification_source = 'category_default'
    elsif plaid_category_primary == 'INCOME'
      self.transaction_type = TRANSACTION_TYPES[:income]
      self.classification_source = 'plaid_category'
    elsif %w[TRANSFER_IN TRANSFER_OUT].include?(plaid_category_primary)
      self.transaction_type = TRANSACTION_TYPES[:transfer]
      self.classification_source = 'plaid_category'
    elsif plaid_category_primary.present?
      # Any other Plaid category is a spend category. A negative amount here
      # is a refund: negative spend, not income.
      self.transaction_type = TRANSACTION_TYPES[:expense]
      self.classification_source = 'plaid_category'
    elsif amount.present? && amount < 0
      # negative amount is income, it's just the way plaid works
      self.transaction_type = TRANSACTION_TYPES[:income]
      self.classification_source = 'sign_inference'
    else
      self.transaction_type = TRANSACTION_TYPES[:expense]
      self.classification_source = 'sign_inference'
    end
  end

  def apply_merchant_default_tags
    merchants_to_check = if merchant.merchant_group
      merchant.merchant_group.merchants.includes(:merchant_default_tags)
    else
      [merchant]
    end

    merchants_to_check.each do |m|
      m.merchant_default_tags.each do |mdt|
        TagPlaidTransaction.find_or_create_by(
          tag_id: mdt.tag_id,
          plaid_transaction_id: id,
          user_id: mdt.user_id
        )
      end
    end
  end

  def self.parse_plaid_transaction(plaid_transaction, account, plaid_account, plaid_sync_event)
    date_string = (plaid_transaction.datetime || plaid_transaction.date).to_s
    date_obj = plaid_transaction.datetime.present? ? Time.iso8601(date_string) : Date.parse(date_string).to_time
    # If the date object is at 00:00:00, add 12 hours to it
    if date_obj.hour == 0 && date_obj.min == 0 && date_obj.sec == 0
      date_obj = date_obj + 12.hours
    end
    
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
      plaid_category_primary: plaid_transaction.personal_finance_category.primary,
      plaid_category_detail: plaid_transaction.personal_finance_category.detailed,
      plaid_category_confidence_level: plaid_transaction.personal_finance_category.confidence_level,
      plaid_categories: plaid_transaction.category,
    }
  end

  # Splits are single-level: a child can never be a parent, and vice versa.
  private def no_nested_splits
    return unless split_child?

    errors.add(:base, 'A split child cannot itself be split') if split
    errors.add(:base, 'Cannot split a child of another split') if parent_transaction&.split_child?
  end

  def self.get_transaction_date(plaid_transaction)
    if plaid_transaction.datetime.present?
      return Time.iso8601(plaid_transaction.datetime)
    else
      return Date.parse(plaid_transaction.date)
    end
  end

end 
