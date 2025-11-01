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

  def moving_average(months_back: 6, transaction_type: 'expense')
    sql = <<-SQL
    SELECT
        day_of_month,
        day_average,
        SUM(day_average) OVER (
            ORDER BY day_of_month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_total,
        SUM(day_average) OVER (
            ORDER BY day_of_month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) / day_of_month AS cumulative_average_per_day
    FROM (
        SELECT
            EXTRACT(DAY FROM pt.date)::INTEGER AS day_of_month,
            SUM(pt.amount) / #{months_back.to_i} AS day_average,
            COUNT(*) AS transaction_count
        FROM
            plaid_transactions pt
            INNER JOIN plaid_accounts pa ON pt.plaid_account_id = pa.id
            INNER JOIN plaid_accounts_users pau ON pau.plaid_account_id = pa.id 
              AND pau.user_id = #{@user_id}
        WHERE
            pt.date >= CURRENT_DATE - INTERVAL '#{months_back.to_i} months'
            AND pt.transaction_type = '#{transaction_type}'
        GROUP BY
            EXTRACT(DAY FROM pt.date)
    ) subquery
    ORDER BY
        day_of_month;
    SQL

    data = ActiveRecord::Base.connection.execute(sql).to_a
    result_map = data.map do |row|
      {
        dayOfMonth: row['day_of_month'].abs,
        dayAverage: row['day_average'].abs,
        cumulativeTotal: row['cumulative_total'].abs,
        cumulativeAveragePerDay: row['cumulative_average_per_day'].abs
      }
    end.sort_by { |item| item[:dayOfMonth] }
    
    # Fill in missing days with previous day's data
    filled_data = []
    previous_day_data = nil
    
    (1..31).each do |day|
      existing_data = result_map.find { |item| item[:dayOfMonth] == day }
      
      if existing_data
        filled_data << existing_data
        previous_day_data = existing_data
      elsif previous_day_data
        # Insert missing day with previous day's data
        filled_data << {
          dayOfMonth: day,
          dayAverage: previous_day_data[:dayAverage],
          cumulativeTotal: previous_day_data[:cumulativeTotal],
          cumulativeAveragePerDay: previous_day_data[:cumulativeAveragePerDay]
        }
      else
        # No previous data exists, use zeros
        filled_data << {
          dayOfMonth: day,
          dayAverage: 0,
          cumulativeTotal: 0,
          cumulativeAveragePerDay: 0
        }
        previous_day_data = filled_data.last
      end
    end
    
    filled_data
  end
end
