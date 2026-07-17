require 'rails_helper'

RSpec.describe 'AccountBalances', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  let(:active_account) { create(:plaid_account, account: account) }
  let(:archived_account) { create(:plaid_account, :archived, account: account) }
  let(:active_pau) { create(:plaid_accounts_user, user: user, plaid_account: active_account) }
  let(:archived_pau) { create(:plaid_accounts_user, user: user, plaid_account: archived_account) }

  before do
    create(:account_balance, plaid_accounts_user: active_pau, current_balance: 100.0)
    create(:account_balance, plaid_accounts_user: archived_pau, current_balance: 50.0)
  end

  describe 'GET /api/plaid_accounts/account_balance' do
    it 'excludes archived accounts by default' do
      get '/api/plaid_accounts/account_balance.json', headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |b| b['id'] }).to contain_exactly(active_account.id)
    end

    it 'includes archived accounts with include_archived=true' do
      get '/api/plaid_accounts/account_balance.json?include_archived=true', headers: headers

      body = JSON.parse(response.body)
      expect(body.map { |b| b['id'] }).to contain_exactly(active_account.id, archived_account.id)
      archived_row = body.find { |b| b['id'] == archived_account.id }
      expect(archived_row['plaidAccount']['archived']).to be true
    end
  end

  describe 'GET /api/plaid_accounts/account_balance_history' do
    it 'still returns history for an archived account' do
      get "/api/plaid_accounts/account_balance_history.json?plaid_account_id=#{archived_account.id}", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
    end
  end
end
