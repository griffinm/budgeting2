class DailySummaryMailer < ApplicationMailer
  def daily_summary_email(user)
    @user = user
    @account = user.account
    @yesterday = Date.yesterday
    
    # Get yesterday's transactions
    @yesterday_transactions = user.plaid_transactions
      .where(date: @yesterday)
      .includes(:merchant, :merchant_tag, :plaid_account)
    
    # Get summary statistics
    @total_expenses = @yesterday_transactions.expense.sum(:amount)
    @total_income = @yesterday_transactions.income.sum(:amount)
    @transaction_count = @yesterday_transactions.count
    
    # Get top spending categories
    @top_categories = @yesterday_transactions.expense
      .joins(:merchant_tag)
      .group('merchant_tags.name')
      .sum(:amount)
      .sort_by { |_, amount| -amount }
      .first(5)
    
    # Get account balances (use created_at for date filtering)
    @account_balances = user.plaid_accounts
      .joins(:account_balances)
      .where(account_balances: { created_at: @yesterday.all_day })
      .includes(:account_balances)
    
    mail(
      to: user.email,
      subject: "Daily Summary - #{@yesterday.strftime('%B %d, %Y')}"
    )
  end
end 