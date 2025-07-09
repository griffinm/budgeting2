namespace :daily_summary do
  desc "Send daily summary emails to all users"
  task send: :environment do
    puts "Sending daily summary emails..."
    DailySummaryJob.new.perform
    puts "Daily summary emails sent!"
  end

  desc "Send daily summary email to a specific user (provide EMAIL=user@example.com)"
  task send_to_user: :environment do
    email = ENV['EMAIL']
    if email.blank?
      puts "Please provide an email address: EMAIL=user@example.com rake daily_summary:send_to_user"
      exit 1
    end

    user = User.find_by(email: email)
    if user.nil?
      puts "User with email #{email} not found"
      exit 1
    end

    puts "Sending daily summary email to #{email}..."
    DailySummaryMailer.daily_summary_email(user).deliver_now
    puts "Daily summary email sent to #{email}!"
  end
end 