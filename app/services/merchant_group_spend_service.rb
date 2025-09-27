class MerchantGroupSpendService < BaseService
  def initialize(merchant_group_id:, current_user:)
    @merchant_group = current_user.account.merchant_groups.find(merchant_group_id)

    if @merchant_group.nil?
      raise ActiveRecord::RecordNotFound, "Merchant group not found"
    end
  end

  def all_time_spend
    @merchant_group.all_transactions.sum(:amount)
  end

  def monthly_spend(months_back: 6)
    data = @merchant_group.all_transactions
      .where(date: months_back.months.ago..Time.current)
      .group_by { |t| t.date.strftime('%Y-%m') }
      .map { |month, transactions| [month, transactions.sum(&:amount)] }
      .to_h

    # Make sure all months are present
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
