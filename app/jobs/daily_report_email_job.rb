class DailyReportEmailJob < ApplicationJob
  queue_as :default

  def perform
    User.includes(:account).find_each do |user|
      DailyReportMailer.daily_report(user).deliver_later
    end
  end
end
