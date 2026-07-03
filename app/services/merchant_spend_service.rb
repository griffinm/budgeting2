class MerchantSpendService < BaseService
  def initialize(merchant:, current_user:)
    @merchant = merchant

    if @merchant.nil?
      raise ActiveRecord::RecordNotFound, "Merchant not found"
    end
  end

  def all_time_spend
    @merchant.plaid_transactions.spend_total
  end

  def all_time_income
    @merchant.plaid_transactions.income_total
  end

  def monthly_spend(months_back: 6, include_group: false)
    monthly_totals(type: :expense, months_back: months_back, include_group: include_group)
  end

  def monthly_income(months_back: 6, include_group: false)
    monthly_totals(type: :income, months_back: months_back, include_group: include_group)
  end

  private

  def monthly_totals(type:, months_back:, include_group:)
    scope = if include_group && @merchant.merchant_group.present?
      @merchant.merchant_group.all_transactions
    else
      @merchant.plaid_transactions
    end

    # Convention (see PlaidTransaction.spend_total/income_total): income is
    # stored negative, so it is negated to read as a positive magnitude
    sign = type == :income ? -1 : 1
    data = scope.public_send(type)
      .not_split_parent
      .where(date: months_back.months.ago..Time.current)
      .group_by { |t| t.date.strftime('%Y-%m') }
      .map { |month, transactions| [month, sign * transactions.sum(&:amount)] }
      .to_h

    fill_and_sort_months(data, months_back)
  end

  def fill_and_sort_months(data, months_back)
    start_month = months_back.months.ago.beginning_of_month
    end_month = Time.current.beginning_of_month

    while start_month <= end_month
      month_key = start_month.strftime('%Y-%m')
      data[month_key] ||= 0
      start_month = start_month.next_month
    end

    sorted = data.sort_by { |month, _| month }
    sorted.map { |month, amount| { month: month, amount: amount } }
  end
end
