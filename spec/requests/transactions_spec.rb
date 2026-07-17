require 'rails_helper'

RSpec.describe 'Transactions', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:headers) { { 'x-budgeting-token' => AuthService.generate_token_for_user(user: user) } }

  let!(:transaction) { create(:plaid_transaction, account: account, merchant: merchant) }
  let!(:sibling_transaction) { create(:plaid_transaction, account: account, merchant: merchant) }
  let!(:other_merchant_transaction) do
    create(:plaid_transaction, account: account,
      merchant: create(:merchant, account: account, merchant_name: 'Other Merchant'))
  end

  describe 'GET /api/transactions' do
    let(:plaid_access_token) { create(:plaid_access_token, account: account) }
    let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }

    before do
      create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
    end

    it 'filters to unconfirmed classifications with needs_review and exposes classificationSource' do
      legacy = create(:plaid_transaction, account: account, plaid_account: plaid_account, classification_source: nil)
      confirmed = create(:plaid_transaction, account: account, plaid_account: plaid_account, classification_source: 'user')

      get '/api/transactions.json', params: { needs_review: 'true' }, headers: headers

      expect(response).to have_http_status(:ok)
      items = JSON.parse(response.body)['items']
      ids = items.map { |t| t['id'] }
      expect(ids).to include(legacy.id)
      expect(ids).not_to include(confirmed.id)
      expect(items.find { |t| t['id'] == legacy.id }['classificationSource']).to be_nil
    end

    it 'returns classificationSource user after a manual type change' do
      transaction = create(:plaid_transaction, account: account, plaid_account: plaid_account, classification_source: nil)

      patch "/api/transactions/#{transaction.id}",
        params: { transaction: { transaction_type: 'expense' } },
        headers: headers, as: :json
      get '/api/transactions.json', params: { needs_review: 'true' }, headers: headers

      ids = JSON.parse(response.body)['items'].map { |t| t['id'] }
      expect(ids).not_to include(transaction.id)
      expect(transaction.reload.classification_source).to eq('user')
    end
  end

  describe 'POST /api/transactions/:id/split' do
    let(:income_tag) { create(:merchant_tag, :income, account: account, user: user) }

    it 'splits the transaction and returns the parent with its children' do
      post "/api/transactions/#{transaction.id}/split",
        params: { children: [
          { amount: 30.00, name: 'Groceries', merchantTagId: income_tag.id },
          { amount: 20.00 }
        ] },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['split']).to be(true)
      expect(body['childTransactions'].size).to eq(2)
      groceries = body['childTransactions'].find { |c| c['name'] == 'Groceries' }
      expect(groceries['amount']).to eq(30.00)
      expect(groceries['parentTransactionId']).to eq(transaction.id)
      expect(groceries['merchantTag']['id']).to eq(income_tag.id)
    end

    it 'returns 422 with error messages when amounts do not sum to the parent' do
      post "/api/transactions/#{transaction.id}/split",
        params: { children: [{ amount: 1.00 }, { amount: 2.00 }] },
        headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)['errors']).to include('Child amounts must sum to the parent amount')
    end

    it 'cannot split a transaction belonging to another account' do
      other_transaction = create(:plaid_transaction)

      post "/api/transactions/#{other_transaction.id}/split",
        params: { children: [{ amount: 30.00 }, { amount: 20.00 }] },
        headers: headers, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'DELETE /api/transactions/:id/split' do
    it 'removes the children and restores the parent' do
      post "/api/transactions/#{transaction.id}/split",
        params: { children: [{ amount: 30.00 }, { amount: 20.00 }] },
        headers: headers, as: :json

      delete "/api/transactions/#{transaction.id}/split", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['split']).to be(false)
      expect(transaction.reload.child_transactions).to be_empty
    end

    it 'returns 422 for a transaction that is not split' do
      delete "/api/transactions/#{transaction.id}/split", headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)['errors']).to include('Transaction is not split')
    end
  end

  describe 'GET /api/transactions/:id for split transactions' do
    it 'includes the parent summary on a child' do
      post "/api/transactions/#{transaction.id}/split",
        params: { children: [{ amount: 30.00 }, { amount: 20.00 }] },
        headers: headers, as: :json
      child = transaction.reload.child_transactions.first

      get "/api/transactions/#{child.id}.json", headers: headers

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['parentTransactionId']).to eq(transaction.id)
      expect(body['parentTransaction']['id']).to eq(transaction.id)
      expect(body['parentTransaction']['amount']).to eq(50.00)
    end
  end

  describe 'PATCH /api/transactions/:id' do
    it 'reclassifies the transaction and records the user as the source' do
      patch "/api/transactions/#{transaction.id}",
        params: { transaction: { transaction_type: 'income' } },
        headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      transaction.reload
      expect(transaction.transaction_type).to eq('income')
      expect(transaction.classification_source).to eq('user')
    end

    context 'when assigning a category' do
      let(:income_tag) { create(:merchant_tag, :income, account: account, user: user) }

      it 're-types the transaction to the category type' do
        patch "/api/transactions/#{transaction.id}",
          params: { transaction: { merchant_tag_id: income_tag.id } },
          headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        transaction.reload
        expect(transaction.merchant_tag_id).to eq(income_tag.id)
        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('user')
      end

      it 'lets an explicit type in the same request win over the category type' do
        patch "/api/transactions/#{transaction.id}",
          params: { transaction: { merchant_tag_id: income_tag.id, transaction_type: 'expense' } },
          headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        transaction.reload
        expect(transaction.merchant_tag_id).to eq(income_tag.id)
        expect(transaction.transaction_type).to eq('expense')
        expect(transaction.classification_source).to eq('user')
      end

      it 'never re-types when the category is removed' do
        transaction.update!(merchant_tag_id: income_tag.id, transaction_type: 'income', classification_source: 'user')

        patch "/api/transactions/#{transaction.id}",
          params: { transaction: { merchant_tag_id: nil } },
          headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        transaction.reload
        expect(transaction.merchant_tag_id).to be_nil
        expect(transaction.transaction_type).to eq('income')
      end
    end

    context 'with use_as_default' do
      it 'propagates a type change to the merchant and its other transactions' do
        patch "/api/transactions/#{transaction.id}",
          params: {
            transaction: { transaction_type: 'income' },
            use_as_default: true,
            merchant_id: merchant.id
          },
          headers: headers, as: :json

        expect(response).to have_http_status(:ok)

        sibling_transaction.reload
        expect(sibling_transaction.transaction_type).to eq('income')
        expect(sibling_transaction.classification_source).to eq('merchant_default')

        expect(merchant.reload.default_transaction_type).to eq('income')

        other_merchant_transaction.reload
        expect(other_merchant_transaction.transaction_type).to eq('expense')
        expect(other_merchant_transaction.merchant.default_transaction_type).to be_nil
      end

      it 'propagates the category type with the category (category always wins)' do
        merchant_tag = create(:merchant_tag, account: account, user: user)
        sibling_transaction.update!(transaction_type: 'income', classification_source: 'user')

        patch "/api/transactions/#{transaction.id}",
          params: {
            transaction: { merchant_tag_id: merchant_tag.id },
            use_as_default: true,
            merchant_id: merchant.id
          },
          headers: headers, as: :json

        expect(response).to have_http_status(:ok)

        sibling_transaction.reload
        expect(sibling_transaction.merchant_tag_id).to eq(merchant_tag.id)
        expect(sibling_transaction.transaction_type).to eq('expense')
        expect(sibling_transaction.classification_source).to eq('merchant_default')

        merchant.reload
        expect(merchant.default_merchant_tag_id).to eq(merchant_tag.id)
        # The type deliberately does not become a merchant default: the
        # category keeps driving classification of future transactions
        expect(merchant.default_transaction_type).to be_nil
      end

      it 'requires a merchant_id' do
        patch "/api/transactions/#{transaction.id}",
          params: {
            transaction: { transaction_type: 'income' },
            use_as_default: true
          },
          headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    it 'rejects requests without a token' do
      patch "/api/transactions/#{transaction.id}",
        params: { transaction: { transaction_type: 'income' } },
        as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
