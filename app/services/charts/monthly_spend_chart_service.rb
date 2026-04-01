module Charts
  class MonthlySpendChartService
    def initialize(user_id)
      @user_id = user_id
      @user = User.find(user_id)
      @today = Time.use_zone(@user.time_zone) { Date.current }
    end

    def to_png
      chart = Gruff::Line.new('600x300')
      apply_theme(chart)
      apply_labels(chart)

      chart.data('This Month', current_month_data, '#E03131')
      chart.data('6-Month Average', six_month_average_data, '#868E96')

      chart.to_image.to_blob
    end

    private

    def days_in_month
      @days_in_month ||= Date.new(@today.year, @today.month, -1).day
    end

    def six_month_average_data
      raw = MonthlySpendService.new(@user_id)
              .moving_average(months_back: 6, transaction_type: 'expense')

      (1..days_in_month).map do |day|
        entry = raw.find { |r| r[:dayOfMonth] == day }
        entry ? entry[:cumulativeTotal].to_f.round(2) : 0.0
      end
    end

    def current_month_data
      transactions = @user.plaid_transactions
                          .expense
                          .not_pending
                          .in_month(@today.month, @today.year)

      daily_amounts = Hash.new(0.0)
      transactions.each do |txn|
        daily_amounts[txn.date.day] += txn.amount.abs
      end

      cumulative = 0.0
      (1..days_in_month).map do |day|
        if day <= @today.day
          cumulative += daily_amounts[day]
          cumulative.round(2)
        end
      end
    end

    def apply_theme(chart)
      chart.theme = {
        colors: ['#E03131', '#868E96'],
        marker_color: '#DEE2E6',
        font_color: '#495057',
        background_colors: 'white'
      }
      chart.hide_dots = true
      chart.line_width = 3
      chart.hide_title = true
      chart.legend_at_bottom = true
      chart.marker_font_size = 14.0
      chart.legend_font_size = 14.0
      chart.y_axis_label_format = lambda { |value|
        "$#{value.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
      }
    end

    def apply_labels(chart)
      label_days = [1, 5, 10, 15, 20, 25, days_in_month]
      chart.labels = label_days.each_with_object({}) do |day, hash|
        hash[day - 1] = day.to_s
      end
    end
  end
end
