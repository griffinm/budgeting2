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

  describe 'split transactions' do
    let(:parent) { create(:plaid_transaction, account: account, merchant: merchant, amount: 50.00) }

    def create_child(**attrs)
      create(:plaid_transaction, :split_child, parent: parent, **attrs)
    end

    it 'links children to their parent' do
      child = create_child(amount: 30.00)

      expect(child.parent_transaction).to eq(parent)
      expect(child.split_child?).to be(true)
      expect(parent.child_transactions).to contain_exactly(child)
    end

    it 'destroys children when the parent is destroyed' do
      child = create_child(amount: 30.00)

      parent.destroy

      expect(PlaidTransaction.exists?(child.id)).to be(false)
    end

    it 'rejects splitting a child of another split' do
      child = create_child(amount: 30.00)
      grandchild = build(:plaid_transaction, :split_child, parent: child)

      expect(grandchild).not_to be_valid
      expect(grandchild.errors[:base]).to include('Cannot split a child of another split')
    end

    it 'rejects marking a child as itself split' do
      child = create_child(amount: 30.00)

      child.split = true

      expect(child).not_to be_valid
      expect(child.errors[:base]).to include('A split child cannot itself be split')
    end

    describe '.not_split_parent' do
      it 'excludes split parents but keeps children and normal transactions' do
        child = create_child(amount: 50.00)
        parent.update!(split: true)
        normal = create(:plaid_transaction, account: account, merchant: merchant)

        expect(PlaidTransaction.not_split_parent).to include(child, normal)
        expect(PlaidTransaction.not_split_parent).not_to include(parent)
      end
    end

    describe 'default category classification' do
      it 'is skipped for children so the chosen category is not clobbered by merchant defaults' do
        default_tag = create(:merchant_tag, account: account, user: user)
        chosen_tag = create(:merchant_tag, account: account, user: user)
        merchant.update!(default_merchant_tag_id: default_tag.id)

        child = create_child(amount: 30.00, merchant_tag_id: chosen_tag.id)

        expect(child.merchant_tag_id).to eq(chosen_tag.id)
      end
    end

    describe 'aggregation totals' do
      it 'excludes split parents from spend_total and income_total' do
        create_child(amount: 30.00)
        create_child(amount: 20.00)
        parent.update!(split: true)

        expect(PlaidTransaction.where(account_id: account.id).spend_total).to eq(50.00)
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
