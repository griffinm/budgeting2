class DailyReportEmailJob < ApplicationJob
  queue_as :default

  def perform
    today = Date.current

    User.includes(:account).find_each do |user|
      next unless should_send?(user, today)

      DailyReportMailer.daily_report(user).deliver_later
    end
  end

  private

  def should_send?(user, today)
    return false unless user.report_enabled?

    case user.report_frequency
    when "daily"
      true
    when "weekly"
      today.wday == user.report_day_of_week
    when "monthly"
      today.day <= 7 && today.wday == user.report_day_of_week
    else
      true
    end
  end
end
