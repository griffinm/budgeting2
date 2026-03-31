class DailyReportMailer < ApplicationMailer
  def daily_report(user)
    @user = user
    @account = user.account

    # TODO: Generate chart images and attach inline
    # attachments.inline["profit_and_loss.png"] = Charts::ProfitAndLossChartService.new(@account).to_png

    mail(to: @user.email, subject: "Your Daily Financial Report")
  end
end
