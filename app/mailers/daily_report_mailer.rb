class DailyReportMailer < ApplicationMailer
  helper do
    def format_dollars(amount)
      prefix = amount < 0 ? '-$' : '$'
      formatted = amount.abs.round(0).to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
      "#{prefix}#{formatted}"
    end
  end

  def daily_report(user)
    @user = user
    @account = user.account
    @today = Time.use_zone(@user.time_zone) { Date.current }

    compute_monthly_summary
    compute_recent_transactions
    compute_category_spending

    attachments.inline["monthly_spend.png"] = Charts::MonthlySpendChartService.new(user.id).to_png

    mail(to: @user.email, subject: "Your Daily Financial Report")
  end

  private

  def compute_monthly_summary
    current_day = @today.day

    expenses = @user.plaid_transactions.expense.not_pending.in_month(@today.month, @today.year)
    income = @user.plaid_transactions.income.not_pending.in_month(@today.month, @today.year)

    @expenses_this_month = expenses.sum { |t| t.amount.abs }
    @income_this_month = income.sum { |t| t.amount.abs }
    @profit_this_month = @income_this_month - @expenses_this_month

    moving_avg = MonthlySpendService.new(@user.id)
                   .moving_average(months_back: 6, transaction_type: 'expense')
    avg_entry = moving_avg.find { |r| r[:dayOfMonth] == current_day }
    @expense_avg_by_today = avg_entry ? avg_entry[:cumulativeTotal].to_f : 0

    @expense_percent_change = if @expense_avg_by_today > 0
      ((@expenses_this_month - @expense_avg_by_today) / @expense_avg_by_today * 100).round(1)
    else
      0
    end
  end

  def compute_recent_transactions
    @recent_transactions = @user.plaid_transactions
                                .where("date >= ?", 24.hours.ago)
                                .not_pending
                                .includes(:merchant, :merchant_tag)
                                .order(date: :desc)
  end

  def compute_category_spending
    current_day = @today.day
    days_in_month = Date.new(@today.year, @today.month, -1).day

    # Month-to-date spending by category (rolled up through hierarchy)
    tag_service = MerchantTagService.new(account_id: @account.id, user_id: @user.id)
    mtd_spending = tag_service.spend_stats_for_all_tags(
      start_date: @today.beginning_of_month - 1.day,
      end_date: @today + 1.day
    )

    all_tags = @account.merchant_tags.active.index_by(&:id)
    top_level_tags = @account.merchant_tags.active.where(parent_merchant_tag_id: nil)

    @category_spending = top_level_tags.filter_map do |tag|
      budget = recursive_budget(tag.id, all_tags)
      next if budget == 0

      mtd_entry = mtd_spending.find { |s| s[:id] == tag.id }
      month_to_date = mtd_entry ? mtd_entry[:total_transaction_amount] : 0
      trend = current_day > 0 ? (month_to_date.to_f / current_day * days_in_month).round(2) : 0
      percent_change = ((trend - budget) / budget * 100).round(1)

      {
        name: tag.name,
        month_to_date: month_to_date.round(2),
        budget: budget,
        trend: trend,
        percent_change: percent_change
      }
    end.sort_by { |c| -c[:month_to_date] }
  end

  def recursive_budget(tag_id, all_tags)
    tag = all_tags[tag_id]
    return 0 unless tag

    children = all_tags.values.select { |t| t.parent_merchant_tag_id == tag_id }
    if children.empty?
      tag.target_budget.to_f
    else
      children.sum { |child| recursive_budget(child.id, all_tags) }
    end
  end
end
