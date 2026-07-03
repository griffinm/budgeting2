class TransactionSplitService < BaseService
  # Children must sum to the parent exactly; amount is a float column, so
  # allow half a cent of accumulated rounding error.
  SUM_TOLERANCE = 0.005

  def initialize(transaction:, account:)
    @transaction = transaction
    @account = account
  end

  # children_params: array of { amount:, name: (optional), merchant_tag_id: (optional) }
  # Returns { transaction: } or { errors: [...] }.
  # Splitting an already-split transaction replaces its children atomically.
  def split(children_params)
    children_params = Array(children_params)
    errors = check_split_params(children_params)
    return { errors: errors } if errors.any?

    ActiveRecord::Base.transaction do
      @transaction.child_transactions.destroy_all if @transaction.split
      children_params.each { |child_params| create_child!(child_params) }
      @transaction.update!(split: true)
    end

    { transaction: @transaction.reload }
  rescue ActiveRecord::RecordInvalid => e
    { errors: e.record.errors.full_messages }
  end

  def unsplit
    return { errors: ['Transaction is not split'] } unless @transaction.split

    ActiveRecord::Base.transaction do
      @transaction.child_transactions.destroy_all
      @transaction.update!(split: false)
    end

    { transaction: @transaction.reload }
  end

  private

  def check_split_params(children_params)
    errors = []
    errors << 'Cannot split a pending transaction' if @transaction.pending
    errors << 'Cannot split a child of another split' if @transaction.split_child?
    errors << 'At least 2 children are required' if children_params.size < 2

    amounts = children_params.map { |child| child[:amount] }
    if amounts.any? { |amount| amount.blank? || amount.to_f.round(2).zero? }
      errors << 'Each child needs a nonzero amount'
    elsif (amounts.sum { |amount| amount.to_f }.round(2) - @transaction.amount.to_f).abs >= SUM_TOLERANCE
      errors << 'Child amounts must sum to the parent amount'
    end

    tag_ids = children_params.map { |child| child[:merchant_tag_id] }.compact_blank.uniq
    unless @account.merchant_tags.where(id: tag_ids).count == tag_ids.size
      errors << 'Category not found'
    end

    errors
  end

  def create_child!(child_params)
    merchant_tag = if child_params[:merchant_tag_id].present?
      @account.merchant_tags.find(child_params[:merchant_tag_id])
    end

    # Category drives type, same as TransactionsController#update: a
    # categorized child takes its category's type (this is what lets a
    # transfer-typed credit card payment split into expenses). An
    # uncategorized child inherits the parent's classification as-is.
    if merchant_tag
      transaction_type = merchant_tag.tag_type
      classification_source = 'user'
    else
      transaction_type = @transaction.transaction_type
      classification_source = @transaction.classification_source
    end

    @transaction.child_transactions.create!(
      account_id: @transaction.account_id,
      plaid_account_id: @transaction.plaid_account_id,
      merchant_id: @transaction.merchant_id,
      plaid_sync_event_id: @transaction.plaid_sync_event_id,
      date: @transaction.date,
      authorized_at: @transaction.authorized_at,
      currency_code: @transaction.currency_code,
      payment_channel: @transaction.payment_channel,
      plaid_category_primary: @transaction.plaid_category_primary,
      plaid_category_detail: @transaction.plaid_category_detail,
      plaid_category_confidence_level: @transaction.plaid_category_confidence_level,
      plaid_categories: @transaction.plaid_categories,
      recurring: @transaction.recurring,
      pending: false,
      plaid_id: "split:#{@transaction.id}:#{SecureRandom.hex(8)}",
      amount: child_params[:amount].to_f.round(2),
      name: child_params[:name].presence || @transaction.name,
      merchant_tag_id: merchant_tag&.id,
      transaction_type: transaction_type,
      classification_source: classification_source
    )
  end
end
