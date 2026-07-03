require 'rails_helper'

RSpec.describe PlaidTransaction, type: :model do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }

  # Classification only runs when no type was explicitly assigned, so every
  # example that exercises the chain builds with transaction_type: nil.
  def classify(**attrs)
    create(:plaid_transaction, account: account, merchant: merchant, transaction_type: nil, **attrs)
  end

  describe 'transaction type classification on create' do
    context 'when the merchant has a default transaction type' do
      before { merchant.update!(default_transaction_type: 'income') }

      it 'uses the merchant default over the Plaid category' do
        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: 50.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('merchant_default')
      end
    end

    context 'when a merchant in the same group has a default transaction type' do
      it 'falls back to the group merchant default' do
        sibling = create(:merchant, account: account, merchant_name: 'Sibling', default_transaction_type: 'income')
        group = MerchantGroup.create!(account: account, name: 'Group', primary_merchant_id: sibling.id)
        group.add_merchant(sibling)
        group.add_merchant(merchant)

        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: 50.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('merchant_default')
      end
    end

    context 'when the merchant has a default category' do
      it 'uses the category type over the Plaid category' do
        income_tag = create(:merchant_tag, :income, account: account, user: user)
        merchant.update!(default_merchant_tag_id: income_tag.id)

        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: -2000.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('category_default')
        expect(transaction.merchant_tag_id).to eq(income_tag.id)
      end

      it 'lets an explicit merchant default type beat the category type' do
        income_tag = create(:merchant_tag, :income, account: account, user: user)
        merchant.update!(default_merchant_tag_id: income_tag.id, default_transaction_type: 'expense')

        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: 50.00)

        expect(transaction.transaction_type).to eq('expense')
        expect(transaction.classification_source).to eq('merchant_default')
      end

      it 'uses a group merchant fallback category the same way' do
        income_tag = create(:merchant_tag, :income, account: account, user: user)
        sibling = create(:merchant, account: account, merchant_name: 'Sibling', default_merchant_tag_id: income_tag.id)
        group = MerchantGroup.create!(account: account, name: 'Group', primary_merchant_id: sibling.id)
        group.add_merchant(sibling)
        group.add_merchant(merchant)

        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: -100.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('category_default')
      end

      it 'beats Plaid transfer detection (documented bypass)' do
        income_tag = create(:merchant_tag, :income, account: account, user: user)
        merchant.update!(default_merchant_tag_id: income_tag.id)

        transaction = classify(plaid_category_primary: 'TRANSFER_OUT', amount: 500.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('category_default')
      end
    end

    context 'when Plaid categorized the transaction' do
      it 'classifies INCOME as income' do
        transaction = classify(plaid_category_primary: 'INCOME', amount: -2000.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('plaid_category')
      end

      it 'classifies TRANSFER_IN as transfer' do
        transaction = classify(plaid_category_primary: 'TRANSFER_IN', amount: -500.00)

        expect(transaction.transaction_type).to eq('transfer')
        expect(transaction.classification_source).to eq('plaid_category')
      end

      it 'classifies TRANSFER_OUT as transfer' do
        transaction = classify(plaid_category_primary: 'TRANSFER_OUT', amount: 500.00)

        expect(transaction.transaction_type).to eq('transfer')
        expect(transaction.classification_source).to eq('plaid_category')
      end

      it 'classifies a negative amount in a spend category as an expense (refund, not income)' do
        transaction = classify(plaid_category_primary: 'FOOD_AND_DRINK', amount: -25.00)

        expect(transaction.transaction_type).to eq('expense')
        expect(transaction.classification_source).to eq('plaid_category')
      end
    end

    context 'when there is no Plaid category' do
      it 'infers income from a negative amount' do
        transaction = classify(plaid_category_primary: nil, amount: -100.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to eq('sign_inference')
      end

      it 'infers expense from a positive amount' do
        transaction = classify(plaid_category_primary: nil, amount: 100.00)

        expect(transaction.transaction_type).to eq('expense')
        expect(transaction.classification_source).to eq('sign_inference')
      end
    end

    context 'when the type was explicitly assigned' do
      it 'keeps the assigned type and leaves classification_source nil' do
        transaction = create(:plaid_transaction,
          account: account,
          merchant: merchant,
          transaction_type: 'income',
          plaid_category_primary: 'FOOD_AND_DRINK',
          amount: 50.00)

        expect(transaction.transaction_type).to eq('income')
        expect(transaction.classification_source).to be_nil
      end
    end

    context 'when the merchant is missing' do
      it 'fails validation instead of raising' do
        transaction = build(:plaid_transaction, merchant: nil, transaction_type: nil)

        expect(transaction).not_to be_valid
        expect(transaction.errors[:transaction_type]).to include("can't be blank")
      end
    end
  end

  describe 'parse_plaid_transaction' do
    it 'does not set a transaction type, leaving classification to the model' do
      plaid_transaction = double(
        transaction_id: 'txn_123',
        amount: -2000.00,
        merchant_name: 'Employer',
        name: 'Payroll',
        authorized_date: Date.yesterday,
        datetime: nil,
        date: Date.yesterday.to_s,
        check_number: nil,
        iso_currency_code: 'USD',
        pending: false,
        payment_channel: 'other',
        personal_finance_category: double(primary: 'INCOME', detailed: 'INCOME_WAGES', confidence_level: 'HIGH'),
        category: ['Transfer', 'Payroll']
      )
      plaid_account = create(:plaid_account, account: account)
      sync_event = create(:plaid_sync_event, account: account)

      attrs = PlaidTransaction.parse_plaid_transaction(plaid_transaction, account, plaid_account, sync_event)

      expect(attrs).not_to have_key(:transaction_type)
    end
  end
end
