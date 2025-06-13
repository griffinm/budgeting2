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
end