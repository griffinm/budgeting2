require 'rails_helper'

RSpec.describe DailyReportMailer, type: :mailer do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }

  describe '#daily_report category spending' do
    it 'includes budgeted expense categories and excludes income categories' do
      create(:merchant_tag, account: account, user: user, name: 'GroceriesBudgeted', target_budget: 500)
      create(:merchant_tag, :income, account: account, user: user, name: 'PaycheckExpected', target_budget: 4000)

      mail = described_class.daily_report(user)
      body = mail.html_part ? mail.html_part.body.to_s : mail.body.to_s

      expect(body).to include('GroceriesBudgeted')
      expect(body).not_to include('PaycheckExpected')
    end
  end
end
