require 'rails_helper'

RSpec.describe 'Merchants', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  describe 'GET /api/merchants/:merchant_id/spend_stats' do
    it 'returns spend and income series' do
      create(:plaid_transaction, account: account, merchant: merchant, amount: 40.00, date: 3.days.ago)
      create(:plaid_transaction, account: account, merchant: merchant, amount: -2000.00, transaction_type: 'income', date: 3.days.ago)

      get "/api/merchants/#{merchant.id}/spend_stats", params: { months_back: 3 }, headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.keys).to include('monthsBack', 'monthlySpend', 'allTimeSpend', 'monthlyIncome', 'allTimeIncome')
      expect(body['allTimeSpend']).to eq(40.0)
      expect(body['allTimeIncome']).to eq(2000.0)
      expect(body['monthlyIncome'].sum { |r| r['amount'] }).to eq(2000.0)
      expect(body['monthlyIncome'].length).to eq(4)
    end
  end
end
