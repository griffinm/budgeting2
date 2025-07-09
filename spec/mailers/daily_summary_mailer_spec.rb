require "rails_helper"

RSpec.describe DailySummaryMailer, type: :mailer do
  describe "daily_summary_email" do
    let(:user) { create(:user) }
    let(:mail) { DailySummaryMailer.daily_summary_email(user) }

    it "renders the headers" do
      expect(mail.subject).to eq("Daily Summary - #{Date.yesterday.strftime('%B %d, %Y')}")
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq([Constants::Email::FROM_ADDRESS])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Daily Summary")
      expect(mail.body.encoded).to match(user.first_name)
    end

    it "includes transaction data when available" do
      # Create a test transaction
      merchant = create(:merchant)
      plaid_account = create(:plaid_account, account: user.account)
      # Associate the plaid_account with the user
      create(:plaid_accounts_user, plaid_account: plaid_account, user: user)
      transaction = create(:plaid_transaction, 
        account: user.account,
        merchant: merchant,
        plaid_account: plaid_account,
        date: Date.yesterday,
        amount: 50.00,
        transaction_type: 'expense'
      )

      mail = DailySummaryMailer.daily_summary_email(user)
      expect(mail.body.encoded).to match(merchant.merchant_name)
      expect(mail.text_part.body.encoded).to match(/-\$50\.00/)
    end
  end
end 