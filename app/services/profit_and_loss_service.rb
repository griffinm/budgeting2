class ProfitAndLossService
  def initialize(account_id:)
    @account = Account.find(account_id)

    if @account.nil?
      raise "Account not found for Account ID: '#{account_id}'"
    end
  end

  def profit_and_loss(months_back: 12)
    begin
      months_back = months_back.to_i
    rescue
      raise "Invalid months_back: '#{months_back}'"
    end
    
    expenses_by_month = @account.plaid_transactions.expense
      .not_pending
      .where('plaid_transactions.date >= ? AND plaid_transactions.date <= ?', Date.today - months_back.months, Date.today.end_of_day)
      .group("DATE_PART('month', plaid_transactions.date)")
      .group("DATE_PART('year', plaid_transactions.date)")
      .select("sum(amount) as amount, DATE_PART('month', plaid_transactions.date) as month, DATE_PART('year', plaid_transactions.date) as year")

    income_by_month = @account.plaid_transactions.income
      .not_pending
      .where('plaid_transactions.date >= ? AND plaid_transactions.date <= ?', Date.today - months_back.months, Date.today.end_of_day)
      .group("DATE_PART('month', plaid_transactions.date)")
      .group("DATE_PART('year', plaid_transactions.date)")
      .select("sum(amount) as amount, DATE_PART('month', plaid_transactions.date) as month, DATE_PART('year', plaid_transactions.date) as year")

    all_months = {}
    
    expenses_by_month.each do |expense|
      key = "#{expense.year.to_i}-#{expense.month.to_i}"
      all_months[key] ||= { year: expense.year.to_i, month: expense.month.to_i, expense: 0, income: 0 }
      all_months[key][:expense] = (expense.amount || 0).abs.round(2)
    end
    
    income_by_month.each do |income|
      key = "#{income.year.to_i}-#{income.month.to_i}"
      all_months[key] ||= { year: income.year.to_i, month: income.month.to_i, expense: 0, income: 0 }
      all_months[key][:income] = (income.amount || 0).abs.round(2)
    end
    
    # Build the final data array
    data = all_months.values.map do |month_data|
      expense_abs = month_data[:expense]
      income_abs = month_data[:income]
      month_date = Date.new(month_data[:year], month_data[:month], 1)
      
      {
        date: month_date,
        expense: expense_abs,
        income: income_abs,
        profit: (income_abs - expense_abs).round(2),
        profitPercentage: expense_abs > 0 ? ((income_abs - expense_abs) / expense_abs * 100).round(2) : 0,
      }
    end

    data.sort_by { |item| item[:date] }
  end
end
