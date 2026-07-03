require 'rails_helper'

RSpec.describe 'Data', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  describe 'GET /api/data/total_for_date_range' do
    let!(:expense) { create(:plaid_transaction, account: account, amount: 40.00, date: 3.days.ago) }
    let!(:refund) { create(:plaid_transaction, account: account, amount: -10.00, date: 3.days.ago) }
    let!(:income) { create(:plaid_transaction, :income, account: account, amount: -1500.00, date: 3.days.ago) }

    it 'returns net expense spend by default' do
      get '/api/data/total_for_date_range', headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['transactionType']).to eq('expense')
      expect(body['total']).to eq(30.0)
    end

    it 'returns income as a positive magnitude' do
      get '/api/data/total_for_date_range', params: { transaction_type: 'income' }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['total']).to eq(1500.0)
    end

    it 'rejects anything that is not a transaction type' do
      expect {
        get '/api/data/total_for_date_range', params: { transaction_type: 'delete_all' }, headers: headers
      }.not_to change(PlaidTransaction, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['error']).to eq('Invalid transaction type')
    end
  end
end
