class TransactionSearchService < BaseService
  def initialize(
    account_id:,
    user_id:,
    start_date: nil,
    end_date: nil,
    merchant_id: nil,
    merchant_name: nil,
    transaction_type: nil,
    check_number: nil,
    currency_code: nil,
    search_term: nil,
    amount_greater_than: nil,
    amount_less_than: nil,
    amount_equal_to: nil,
    has_no_category: nil,
    merchant_tag_id: nil,
    merchant_group_id: nil
  )
    @account_id = account_id
    @user_id = user_id
    @start_date = start_date
    @end_date = end_date
    @merchant_id = merchant_id
    @merchant_name = merchant_name
    @transaction_type = transaction_type
    @check_number = check_number
    @currency_code = currency_code
    @search_term = search_term
    @amount_greater_than = amount_greater_than
    @amount_less_than = amount_less_than
    @amount_equal_to = amount_equal_to
    @has_no_category = has_no_category
    @merchant_tag_id = merchant_tag_id
    @merchant_group_id = merchant_group_id

    @user = User.find(@user_id)
    @account = Account.find(@account_id)
  end
  
  def call
    errors = check_params
    if errors.any?
      return { errors: errors }
    end
    
    transactions = @user.plaid_transactions.joins(:plaid_account, :merchant)
      .includes(:plaid_account, :merchant, :merchant_tag, merchant: :default_merchant_tag)
      .order(date: :desc)
      
    if @merchant_group_id.present? || @merchant_id.present?
      if @merchant_group_id.present?
        # Group was passed, so ignore the merchant ID
        transactions = transactions.where(merchant_id: Merchant.in_group(@merchant_group_id).pluck(:id))
      else
        # No group was passed, so use the merchant ID
        transactions = transactions.where(merchant_id: @merchant_id)
      end
    end
    
    if @merchant_tag_id.present?
      tag = MerchantTag.find(@merchant_tag_id)
      child_ids = tag.child_ids + [tag.id]
      transactions = transactions.where(merchant_tag_id: child_ids)
    end

    if @has_no_category.present? && @has_no_category == "true"
      transactions = transactions.where(merchant_tag_id: nil)
    end

    if @amount_greater_than.present?
      transactions = transactions.where("amount > ?", @amount_greater_than)
    end

    if @amount_equal_to.present?
      transactions = transactions.where("amount = ?", @amount_equal_to)
    end

    if @amount_less_than.present?
      transactions = transactions.where("amount < ?", @amount_less_than)
    end

    if @amount_less_than.present?
      transactions = transactions.where("amount < ?", @amount_less_than)
    end

    if @start_date.present?
      transactions = transactions.where(date: @start_date..@end_date)
    end

    if @end_date.present?
      transactions = transactions.where(date: @start_date..@end_date)
    end


    if @merchant_name.present?
      transactions = transactions.where(merchant_name: @merchant_name)
    end

    if @transaction_type.present?
      transactions = transactions.where(transaction_type: @transaction_type)
    end

    if @check_number.present?
      transactions = transactions.where(check_number: @check_number)
    end

    if @currency_code.present?
      transactions = transactions.where(currency_code: @currency_code)
    end

    if @search_term.present?
      transactions = transactions.where("plaid_transactions.name ILIKE ? OR merchants.merchant_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end


    transactions
  end

  private def check_params
    errors = []
    if @start_date.present? && @end_date.present? && @start_date > @end_date
      errors << "Start date must be before end date"
    end

    if @amount_greater_than.present? && @amount_less_than.present? && @amount_greater_than > @amount_less_than
      errors << "Amount greater than must be less than amount less than"
    end

    if @transaction_type.present? && !PlaidTransaction::TRANSACTION_TYPES.value?(@transaction_type)
      errors << "Invalid transaction type"
    end

    errors
  end
end
