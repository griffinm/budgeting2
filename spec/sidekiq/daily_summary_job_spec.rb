require "rails_helper"

RSpec.describe DailySummaryJob, type: :job do
  describe "#perform" do
    let!(:user1) { create(:user) }
    let!(:user2) { create(:user) }

    it "sends daily summary emails to all users" do
      expect(DailySummaryMailer).to receive(:daily_summary_email).with(user1).and_return(double(deliver_now: true))
      expect(DailySummaryMailer).to receive(:daily_summary_email).with(user2).and_return(double(deliver_now: true))

      DailySummaryJob.new.perform
    end

    it "logs success messages" do
      allow(DailySummaryMailer).to receive(:daily_summary_email).and_return(double(deliver_now: true))
      allow(Rails.logger).to receive(:info)

      DailySummaryJob.new.perform

      expect(Rails.logger).to have_received(:info).with("Daily summary email sent to #{user1.email}")
      expect(Rails.logger).to have_received(:info).with("Daily summary email sent to #{user2.email}")
    end

    it "handles errors gracefully" do
      allow(DailySummaryMailer).to receive(:daily_summary_email).with(user1).and_raise("Email error")
      allow(DailySummaryMailer).to receive(:daily_summary_email).with(user2).and_return(double(deliver_now: true))
      allow(Rails.logger).to receive(:error)
      allow(Rails.logger).to receive(:info)

      expect { DailySummaryJob.new.perform }.not_to raise_error

      expect(Rails.logger).to have_received(:error).with("Failed to send daily summary email to #{user1.email}: Email error")
      expect(Rails.logger).to have_received(:info).with("Daily summary email sent to #{user2.email}")
    end
  end
end 