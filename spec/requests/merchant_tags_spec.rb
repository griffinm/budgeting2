require 'rails_helper'

RSpec.describe 'MerchantTags', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  describe 'GET /api/merchant_tags' do
    it 'includes the tag type' do
      create(:merchant_tag, :income, account: account, user: user, name: 'Income')

      get '/api/merchant_tags', headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      tag = JSON.parse(response.body).find { |t| t['name'] == 'Income' }
      expect(tag['tagType']).to eq('income')
    end

    it 'rejects requests without a token' do
      get '/api/merchant_tags', as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/merchant_tags' do
    it 'creates an income root category' do
      post '/api/merchant_tags',
        params: { merchant_tag: { name: 'Side Hustles', tag_type: 'income' } },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['tagType']).to eq('income')
    end

    it 'forces a child to inherit the parent type regardless of the passed value' do
      income_root = create(:merchant_tag, :income, account: account, user: user)

      post '/api/merchant_tags',
        params: { merchant_tag: { name: 'Bonus', parent_merchant_tag_id: income_root.id, tag_type: 'expense' } },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['tagType']).to eq('income')
    end
  end

  describe 'PUT /api/merchant_tags/:id' do
    it 'flips descendants when a root type changes' do
      root = create(:merchant_tag, account: account, user: user)
      child = create(:merchant_tag, account: account, user: user, parent_merchant_tag_id: root.id)

      put "/api/merchant_tags/#{root.id}",
        params: { merchant_tag: { tag_type: 'income' } },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(child.reload.tag_type).to eq('income')
    end

    it 'ignores a tag type change on a child' do
      root = create(:merchant_tag, account: account, user: user)
      child = create(:merchant_tag, account: account, user: user, parent_merchant_tag_id: root.id)

      put "/api/merchant_tags/#{child.id}",
        params: { merchant_tag: { tag_type: 'income' } },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(child.reload.tag_type).to eq('expense')
    end
  end
end
