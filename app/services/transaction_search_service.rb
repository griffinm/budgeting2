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
    search_term: nil,
    amount_greater_than: nil,
    amount_less_than: nil,
    amount_equal_to: nil,
    has_no_category: nil,
    merchant_tag_id: nil,
    merchant_group_id: nil,
    plaid_account_ids: nil
  )
    @account_id = account_id
    @user_id = user_id
    @start_date = start_date
    @end_date = end_date
    @merchant_id = merchant_id
    @merchant_name = merchant_name
    @transaction_type = transaction_type
    @check_number = check_number
    @search_term = search_term
    @amount_greater_than = amount_greater_than
    @amount_less_than = amount_less_than
    @amount_equal_to = amount_equal_to
    @has_no_category = has_no_category
    @merchant_tag_id = merchant_tag_id
    @merchant_group_id = merchant_group_id
    @plaid_account_ids = plaid_account_ids

    @user = User.find(@user_id)
    @account = Account.find(@account_id)
  end
  
  def call
    errors = check_params
    if errors.any?
      return { errors: errors }
    end
    
    transactions = @user.plaid_transactions.joins(:plaid_account, :merchant)
      .includes(
        :plaid_account, 
        :merchant_tag, 
        merchant: [
          :default_merchant_tag,
          { merchant_group: [:primary_merchant, :merchants] }
        ]
      )
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

    if @start_date.present? || @end_date.present?
      # Dates are stored in UTC but represent the user's timezone
      # Convert the date range to UTC based on user's timezone
      user_timezone = ActiveSupport::TimeZone[@user.time_zone] || Time.zone
      
      start_time = if @start_date.present?
        user_timezone.parse(@start_date.to_s).beginning_of_day.utc
      else
        nil
      end
      
      end_time = if @end_date.present?
        user_timezone.parse(@end_date.to_s).end_of_day.utc
      else
        nil
      end
      
      if start_time && end_time
        transactions = transactions.where(date: start_time..end_time)
      elsif start_time
        transactions = transactions.where("date >= ?", start_time)
      elsif end_time
        transactions = transactions.where("date <= ?", end_time)
      end
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

    if @search_term.present?
      transactions = transactions.where("plaid_transactions.name ILIKE ? OR merchants.merchant_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end

    if @plaid_account_ids.present? && @plaid_account_ids.is_a?(Array) && @plaid_account_ids.any?
      transactions = transactions.where(plaid_account_id: @plaid_account_ids)
    end

    # Convert dates back to user's timezone without changing the actual time
    # This re-interprets the UTC times as being in the user's local timezone
    convert_transaction_dates_to_user_timezone(transactions)
    
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

  private def convert_transaction_dates_to_user_timezone(transactions)
    # Get user's timezone
    user_timezone = ActiveSupport::TimeZone[@user.time_zone] || Time.zone
    
    # Convert each transaction's date to user's timezone without changing the time
    transactions.each do |transaction|
      if transaction.date.present?
        utc_time = transaction.date.utc
        # Re-interpret the UTC time as being in the user's timezone
        # This keeps the same clock time but changes the zone
        transaction.date = user_timezone.local(
          utc_time.year,
          utc_time.month,
          utc_time.day,
          utc_time.hour,
          utc_time.min,
          utc_time.sec
        )
      end
      
      if transaction.authorized_at.present?
        utc_time = transaction.authorized_at.utc
        transaction.authorized_at = user_timezone.local(
          utc_time.year,
          utc_time.month,
          utc_time.day,
          utc_time.hour,
          utc_time.min,
          utc_time.sec
        )
      end
    end
  end
end
