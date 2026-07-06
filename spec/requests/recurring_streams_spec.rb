require 'rails_helper'

RSpec.describe 'RecurringStreams', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  let(:other_account) { create(:account) }
  let(:other_stream) { create(:recurring_stream, account: other_account, merchant: create(:merchant, account: other_account)) }

  describe 'GET /api/recurring_streams' do
    it 'returns the account streams with pagination' do
      stream = create(:recurring_stream, account: account, merchant: merchant)
      other_stream

      get '/api/recurring_streams.json', headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['items'].length).to eq(1)
      item = body['items'].first
      expect(item['id']).to eq(stream.id)
      expect(item.keys).to include('status', 'frequency', 'averageAmount', 'predictedNextDate', 'occurrenceCount', 'active', 'merchant')
      expect(item['merchant']['id']).to eq(merchant.id)
      expect(body['page']).to include('currentPage' => 1, 'totalCount' => 1)
    end

    it 'filters by status' do
      create(:recurring_stream, account: account, merchant: merchant)
      confirmed = create(:recurring_stream, :confirmed, account: account, merchant: merchant, amount_signature: '20.00')

      get '/api/recurring_streams.json', params: { status: 'confirmed' }, headers: headers

      body = JSON.parse(response.body)
      expect(body['items'].map { |i| i['id'] }).to eq([confirmed.id])
    end

    it 'rejects an invalid status filter' do
      get '/api/recurring_streams.json', params: { status: 'bogus' }, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to be_present
    end

    it 'requires authentication' do
      get '/api/recurring_streams.json'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/recurring_streams/:id/confirm' do
    it 'confirms the stream and flags its transactions' do
      stream = create(:recurring_stream, account: account, merchant: merchant)
      transaction = create(:plaid_transaction, account: account, merchant: merchant, recurring_stream: stream)

      patch "/api/recurring_streams/#{stream.id}/confirm", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['status']).to eq('confirmed')
      expect(transaction.reload.recurring).to be(true)
    end

    it 'rejects confirming a dismissed stream' do
      stream = create(:recurring_stream, :dismissed, account: account, merchant: merchant)

      patch "/api/recurring_streams/#{stream.id}/confirm", headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(stream.reload.status).to eq('dismissed')
    end

    it 'cannot touch another account stream' do
      patch "/api/recurring_streams/#{other_stream.id}/confirm", headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/recurring_streams/:id/dismiss' do
    it 'dismisses the stream and unflags its transactions' do
      stream = create(:recurring_stream, :confirmed, account: account, merchant: merchant)
      transaction = create(:plaid_transaction, account: account, merchant: merchant,
        recurring_stream: stream, recurring: true)

      patch "/api/recurring_streams/#{stream.id}/dismiss", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['status']).to eq('dismissed')
      transaction.reload
      expect(transaction.recurring).to be(false)
      expect(transaction.recurring_stream_id).to eq(stream.id)
    end
  end

  describe 'POST /api/recurring_streams/detect' do
    it 'runs detection and returns counts' do
      start = 150.days.ago.to_date
      5.times do |i|
        create(:plaid_transaction, account: account, merchant: merchant, amount: 15.99, date: start + (i * 30).days)
      end

      post '/api/recurring_streams/detect', headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['created']).to eq(1)
      expect(account.recurring_streams.sole.status).to eq('suggested')
    end
  end
end
