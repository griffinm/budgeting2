class DailySummaryJob < SidekiqJob
  def perform
    User.find_each do |user|
      begin
        DailySummaryMailer.daily_summary_email(user).deliver_now
        Rails.logger.info "Daily summary email sent to #{user.email}"
      rescue => e
        Rails.logger.error "Failed to send daily summary email to #{user.email}: #{e.message}"
        # Don't raise the error to prevent the job from failing for all users
        # if one user's email fails
      end
    end
  end
end 