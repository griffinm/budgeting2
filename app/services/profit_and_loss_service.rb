class ProfitAndLossService
  def initialize(user_id:)
    @user = User.find(user_id)
    @account = @user.account
    @tz = @user.time_zone
    @iana_tz = ActiveSupport::TimeZone[@tz].tzinfo.name
  end

  def profit_and_loss(months_back: 12)
    months_back = Integer(months_back)

    start_time, end_time = Time.use_zone(@tz) do
      [(Time.zone.now - months_back.months).beginning_of_month, Time.zone.now.end_of_day]
    end

    quoted_tz = ActiveRecord::Base.connection.quote(@iana_tz)
    tz_date = "(plaid_transactions.date AT TIME ZONE 'UTC' AT TIME ZONE #{quoted_tz})"

    base = @account.plaid_transactions
      .not_pending
      .where('plaid_transactions.date >= ? AND plaid_transactions.date <= ?', start_time, end_time)
      .group("DATE_PART('month', #{tz_date}), DATE_PART('year', #{tz_date})")
      .select("sum(amount) as amount, DATE_PART('month', #{tz_date}) as month, DATE_PART('year', #{tz_date}) as year")

    expenses_by_month = base.expense
    income_by_month = base.income

    months = month_keys(start_time, end_time).index_with { { expense: 0.0, income: 0.0 } }

    # Sign-correct rather than abs (see PlaidTransaction.spend_total): expenses
    # are stored positive and income negative, and abs would flip the sign of a
    # refund-heavy month instead of letting it net out.
    expenses_by_month.each do |row|
      key = [row.year.to_i, row.month.to_i]
      months[key] ||= { expense: 0.0, income: 0.0 }
      months[key][:expense] = (row.amount || 0).round(2)
    end

    income_by_month.each do |row|
      key = [row.year.to_i, row.month.to_i]
      months[key] ||= { expense: 0.0, income: 0.0 }
      months[key][:income] = (-(row.amount || 0)).round(2)
    end

    months.map do |(year, month), data|
      expense = data[:expense]
      income = data[:income]
      {
        date: Date.new(year, month, 1),
        year: year,
        month: month,
        expense: expense,
        income: income,
        profit: (income - expense).round(2),
        profitPercentage: expense > 0 ? ((income - expense) / expense * 100).round(2) : 0,
      }
    end.sort_by { |item| [item[:year], item[:month]] }
  end

  private

  def month_keys(start_time, end_time)
    Time.use_zone(@tz) do
      cursor = start_time.in_time_zone(@tz).beginning_of_month
      stop = end_time.in_time_zone(@tz).beginning_of_month
      keys = []
      while cursor <= stop
        keys << [cursor.year, cursor.month]
        cursor = cursor + 1.month
      end
      keys
    end
  end
end
