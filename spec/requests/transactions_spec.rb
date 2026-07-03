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

      it 'does not touch transaction types when only the category changed' do
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
        expect(sibling_transaction.transaction_type).to eq('income')
        expect(sibling_transaction.classification_source).to eq('user')

        merchant.reload
        expect(merchant.default_merchant_tag_id).to eq(merchant_tag.id)
        expect(merchant.default_transaction_type).to be_nil
      end

      it 'requires a merchant_id' do
        patch "/api/transactions/#{transaction.id}",
          params: {
            transaction: { transaction_type: 'income' },
            use_as_default: true
          },
          headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
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
