class MonthlySpendService
  def initialize(user_id)
    @user_id = user_id
    @user = User.find(user_id)
    @account = @user.account
  end

  def monthly_spend(month: Date.today.month, year: Date.today.year)
    Rails.logger.debug("Getting monthly spend for #{@user.email} in #{month}/#{year}")
    @transactions = @account.plaid_transactions.expense.in_month(month, year)
    @transactions.includes(:merchants, :merchant_tags, merchant: [:default_merchant_tag])
  end

  def monthly_income(month: Date.today.month, year: Date.today.year)
    Rails.logger.debug("Getting monthly income for #{@user.email} in #{month}/#{year}")
  end

  def average_income_for_months_back(months_back: 1)
    starting_month = (Date.today - (months_back.to_i + 1).months).month
    starting_year = (Date.today - (months_back.to_i + 1).months).year
    
    ending_month = (Date.today - 1.month).month
    ending_year = (Date.today - 1.month).year

    averages =@account.plaid_transactions.income
      .where('plaid_transactions.date >= ?', Date.new(starting_year, starting_month, 1))
      .where('plaid_transactions.date <= ?', Date.new(ending_year, ending_month, -1))
      .group('DATE_PART(\'month\', plaid_transactions.date)')
      .sum(:amount)

    average = averages.values.reduce(:+) / averages.length.to_f
    return average.abs.round
  end

  def average_expense_for_months_back(months_back: 1)
    starting_month = (Date.today - (months_back.to_i + 1).months).month
    starting_year = (Date.today - (months_back.to_i + 1).months).year
    
    ending_month = (Date.today - 1.month).month
    ending_year = (Date.today - 1.month).year

    averages = @account.plaid_transactions.expense
      .where('plaid_transactions.date >= ?', Date.new(starting_year, starting_month, 1))
      .where('plaid_transactions.date <= ?', Date.new(ending_year, ending_month, -1))
      .group('DATE_PART(\'month\', plaid_transactions.date)')
      .sum(:amount)

    average = averages.values.reduce(:+) / averages.length.to_f
    return average.abs.round
  end
end
