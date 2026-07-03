require 'rails_helper'

RSpec.describe TransactionSplitService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:parent) { create(:plaid_transaction, account: account, merchant: merchant, amount: 100.00, name: 'ATM Withdrawal') }

  def service(transaction: parent)
    described_class.new(transaction: transaction, account: account)
  end

  describe '#split' do
    it 'creates children, marks the parent split, and returns it' do
      result = service.split([
        { amount: 60.00, name: 'Groceries' },
        { amount: 40.00 }
      ])

      expect(result[:errors]).to be_nil
      transaction = result[:transaction]
      expect(transaction.split).to be(true)
      expect(transaction.child_transactions.count).to eq(2)

      groceries, rest = transaction.child_transactions.order(:id)
      expect(groceries.name).to eq('Groceries')
      expect(groceries.amount).to eq(60.00)
      expect(rest.name).to eq('ATM Withdrawal') # defaults to the parent's name
      expect(rest.amount).to eq(40.00)
    end

    it 'supports more than 2 children' do
      result = service.split([
        { amount: 33.33 },
        { amount: 33.33 },
        { amount: 33.34 }
      ])

      expect(result[:errors]).to be_nil
      expect(result[:transaction].child_transactions.count).to eq(3)
    end

    it 'children inherit the parent context and get synthetic plaid ids' do
      result = service.split([{ amount: 60.00 }, { amount: 40.00 }])

      result[:transaction].child_transactions.each do |child|
        expect(child.account_id).to eq(parent.account_id)
        expect(child.plaid_account_id).to eq(parent.plaid_account_id)
        expect(child.merchant_id).to eq(parent.merchant_id)
        expect(child.plaid_sync_event_id).to eq(parent.plaid_sync_event_id)
        expect(child.date).to eq(parent.date)
        expect(child.currency_code).to eq(parent.currency_code)
        expect(child.pending).to be(false)
        expect(child.plaid_id).to start_with("split:#{parent.id}:")
      end
    end

    it 'a categorized child takes its category type (transfer parent splits into expenses)' do
      transfer_parent = create(:plaid_transaction, :transfer, account: account, merchant: merchant, amount: 100.00)
      expense_tag = create(:merchant_tag, account: account, user: user, tag_type: 'expense')

      result = service(transaction: transfer_parent).split([
        { amount: 70.00, merchant_tag_id: expense_tag.id },
        { amount: 30.00 }
      ])

      categorized, uncategorized = result[:transaction].child_transactions.order(:id)
      expect(categorized.merchant_tag_id).to eq(expense_tag.id)
      expect(categorized.transaction_type).to eq('expense')
      expect(categorized.classification_source).to eq('user')
      expect(uncategorized.transaction_type).to eq('transfer') # inherits the parent
      expect(uncategorized.classification_source).to eq(transfer_parent.classification_source)
    end

    it 'a chosen category survives a merchant default category' do
      default_tag = create(:merchant_tag, account: account, user: user)
      chosen_tag = create(:merchant_tag, account: account, user: user)
      merchant.update!(default_merchant_tag_id: default_tag.id)

      result = service.split([
        { amount: 60.00, merchant_tag_id: chosen_tag.id },
        { amount: 40.00 }
      ])

      expect(result[:transaction].child_transactions.order(:id).first.merchant_tag_id).to eq(chosen_tag.id)
    end

    it 'replaces existing children when re-splitting' do
      service.split([{ amount: 60.00 }, { amount: 40.00 }])
      old_child_ids = parent.reload.child_transactions.pluck(:id)

      result = service.split([{ amount: 50.00 }, { amount: 30.00 }, { amount: 20.00 }])

      expect(result[:errors]).to be_nil
      expect(result[:transaction].child_transactions.count).to eq(3)
      expect(PlaidTransaction.where(id: old_child_ids)).to be_empty
    end

    it 'rolls back everything when a child fails to save' do
      allow(SecureRandom).to receive(:hex).and_return('samehex') # forces a plaid_id collision

      result = service.split([{ amount: 60.00 }, { amount: 40.00 }])

      expect(result[:errors]).to be_present
      expect(parent.reload.split).to be(false)
      expect(parent.child_transactions).to be_empty
    end

    describe 'guards' do
      it 'rejects a pending parent' do
        pending_parent = create(:plaid_transaction, :pending, account: account, merchant: merchant, amount: 100.00)

        result = service(transaction: pending_parent).split([{ amount: 60.00 }, { amount: 40.00 }])

        expect(result[:errors]).to include('Cannot split a pending transaction')
      end

      it 'rejects splitting a split child' do
        service.split([{ amount: 60.00 }, { amount: 40.00 }])
        child = parent.reload.child_transactions.first

        result = service(transaction: child).split([{ amount: 30.00 }, { amount: 30.00 }])

        expect(result[:errors]).to include('Cannot split a child of another split')
      end

      it 'rejects fewer than 2 children' do
        result = service.split([{ amount: 100.00 }])

        expect(result[:errors]).to include('At least 2 children are required')
      end

      it 'rejects zero and missing amounts' do
        expect(service.split([{ amount: 0 }, { amount: 100.00 }])[:errors])
          .to include('Each child needs a nonzero amount')
        expect(service.split([{ name: 'No amount' }, { amount: 100.00 }])[:errors])
          .to include('Each child needs a nonzero amount')
      end

      it 'rejects amounts that do not sum to the parent amount' do
        result = service.split([{ amount: 60.00 }, { amount: 50.00 }])

        expect(result[:errors]).to include('Child amounts must sum to the parent amount')
        expect(parent.reload.split).to be(false)
      end

      it 'rejects a category from another account' do
        other_tag = create(:merchant_tag)

        result = service.split([
          { amount: 60.00, merchant_tag_id: other_tag.id },
          { amount: 40.00 }
        ])

        expect(result[:errors]).to include('Category not found')
      end
    end
  end

  describe '#unsplit' do
    it 'destroys children and restores the parent' do
      service.split([{ amount: 60.00 }, { amount: 40.00 }])

      result = service(transaction: parent.reload).unsplit

      expect(result[:errors]).to be_nil
      expect(result[:transaction].split).to be(false)
      expect(parent.reload.child_transactions).to be_empty
    end

    it 'errors on a transaction that is not split' do
      result = service.unsplit

      expect(result[:errors]).to include('Transaction is not split')
    end
  end
end
