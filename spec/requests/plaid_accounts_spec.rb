require 'rails_helper'

RSpec.describe 'PlaidAccounts', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  let(:plaid_account) { create(:plaid_account, account: account, nickname: 'Checking') }

  before do
    create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
  end

  describe 'GET /api/plaid_accounts' do
    it 'includes the archived fields' do
      get '/api/plaid_accounts.json', headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.first).to include('archived' => false, 'archivedAt' => nil)
    end
  end

  describe 'PATCH /api/plaid_accounts/:id' do
    it 'archives the account' do
      patch "/api/plaid_accounts/#{plaid_account.id}", params: { archived: true }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['archived']).to be true
      expect(body['archivedAt']).to be_present
      expect(plaid_account.reload.archived_at).to be_present
    end

    it 'unarchives the account' do
      plaid_account.update!(archived_at: 1.day.ago)

      patch "/api/plaid_accounts/#{plaid_account.id}", params: { archived: false }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['archived']).to be false
      expect(plaid_account.reload.archived_at).to be_nil
    end

    it 'preserves the nickname on an archive-only PATCH' do
      patch "/api/plaid_accounts/#{plaid_account.id}", params: { archived: true }, headers: headers, as: :json

      expect(plaid_account.reload.nickname).to eq('Checking')
    end

    it 'preserves archived_at on a nickname-only PATCH' do
      plaid_account.update!(archived_at: 1.day.ago)

      patch "/api/plaid_accounts/#{plaid_account.id}", params: { nickname: 'Renamed' }, headers: headers, as: :json

      expect(plaid_account.reload.nickname).to eq('Renamed')
      expect(plaid_account.archived_at).to be_present
    end

    it 'still updates the nickname' do
      patch "/api/plaid_accounts/#{plaid_account.id}", params: { nickname: 'New Name' }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(plaid_account.reload.nickname).to eq('New Name')
    end

    it 'requires authentication' do
      patch "/api/plaid_accounts/#{plaid_account.id}", params: { archived: true }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 404 for another household's account" do
      other_account = create(:plaid_account)

      patch "/api/plaid_accounts/#{other_account.id}", params: { archived: true }, headers: headers, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
