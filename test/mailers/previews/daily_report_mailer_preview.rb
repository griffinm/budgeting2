class DailyReportMailerPreview < ActionMailer::Preview
  def daily_report
    DailyReportMailer.daily_report(User.first)
  end
end
