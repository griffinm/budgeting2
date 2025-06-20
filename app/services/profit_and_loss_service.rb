class ProfitAndLossService
  def initialize(account_id:)
    @account = Account.find(account_id)

    if @account.nil?
      raise "Account not found for Account ID: '#{@account_id}'"
    end
  end

  def profit_and_loss(months_back: 12)
    begin
      months_back = months_back.to_i
    rescue
      raise "Invalid months_back: '#{months_back}'"
    end
    
    expenses_by_month = @account.plaid_transactions.expense
      .where('plaid_transactions.date >= ?', Date.today - months_back.months)
      .group('DATE_PART(\'month\', plaid_transactions.date)')
      .group('DATE_PART(\'year\', plaid_transactions.date)')
      .select('sum(amount) as amount, DATE_PART(\'month\', plaid_transactions.date) as month, DATE_PART(\'year\', plaid_transactions.date) as year')

    income_by_month = @account.plaid_transactions.income
      .where('plaid_transactions.date >= ?', Date.today - months_back.months)
      .group('DATE_PART(\'month\', plaid_transactions.date)')
      .group('DATE_PART(\'year\', plaid_transactions.date)')
      .select('sum(amount) as amount, DATE_PART(\'month\', plaid_transactions.date) as month, DATE_PART(\'year\', plaid_transactions.date) as year')

    data = []
    expenses_by_month.each do |expense|
      total_income = income_by_month.find { |income| income.month == expense.month && income.year == expense.year }&.amount || 0
      total_expense = expense.amount || 0
      income_abs = (total_income || 0).abs.round(2)
      expense_abs = (total_expense || 0).abs.round(2)
      month_date = Date.new(expense.year, expense.month, 1)
      data << {
        date: month_date,
        expense: expense_abs,
        income: income_abs,
        profit: (income_abs - expense_abs).round(2),
        profit_percentage: ((income_abs - expense_abs) / expense_abs * 100).round(2),
      }
    end

    data.sort_by { |item| item[:date] }
  end
end