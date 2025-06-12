class TransactionSearchService < BaseService
  def initialize(
    account_id:,
    user_id:,
    start_date: nil,
    end_date: nil,
    merchant_id: nil,
    merchant_name: nil,
    plaid_category_primary: nil,
    plaid_category_detail: nil,
    payment_channel: nil,
    transaction_type: nil,
    check_number: nil,
    currency_code: nil,
    pending: nil,
    search_term: nil
  )
    @account_id = account_id
    @user_id = user_id
    @start_date = start_date
    @end_date = end_date
    @merchant_id = merchant_id
    @merchant_name = merchant_name
    @plaid_category_primary = plaid_category_primary
    @plaid_category_detail = plaid_category_detail
    @payment_channel = payment_channel
    @transaction_type = transaction_type
    @check_number = check_number
    @currency_code = currency_code
    @pending = pending
    @search_term = search_term
  end

  def call
    transactions = PlaidTransaction.joins(:plaid_account, :merchant)
      .includes(:plaid_account, :merchant, :merchant_tag)
      .where(plaid_transactions: { account_id: @account_id })
      .order(date: :desc)

    if @user_id.present?
      transactions = transactions.where(plaid_accounts: { user_id: @user_id })
    end

    if @start_date.present?
      transactions = transactions.where(date: @start_date..@end_date)
    end

    if @end_date.present?
      transactions = transactions.where(date: @start_date..@end_date)
    end

    if @merchant_id.present?
      transactions = transactions.where(merchant_id: @merchant_id)
    end

    if @merchant_name.present?
      transactions = transactions.where(merchant_name: @merchant_name)
    end

    if @plaid_category_primary.present?
      transactions = transactions.where(plaid_category_primary: @plaid_category_primary)
    end

    if @plaid_category_detail.present?
      transactions = transactions.where(plaid_category_detail: @plaid_category_detail)
    end

    if @payment_channel.present?
      transactions = transactions.where(payment_channel: @payment_channel)
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

    if @pending.present?
      transactions = transactions.where(pending: @pending)
    end

    if @search_term.present?
      transactions = transactions.where("plaid_transactions.name ILIKE ? OR merchants.merchant_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end

    transactions
  end
end
