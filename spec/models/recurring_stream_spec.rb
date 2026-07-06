require 'rails_helper'

RSpec.describe RecurringStream, type: :model do
  let(:account) { create(:account) }
  let(:merchant) { create(:merchant, account: account) }

  describe 'validations' do
    it 'accepts valid attributes' do
      expect(build(:recurring_stream, account: account, merchant: merchant)).to be_valid
    end

    it 'rejects unknown source' do
      expect(build(:recurring_stream, account: account, merchant: merchant, source: 'guess')).not_to be_valid
    end

    it 'rejects unknown status' do
      expect(build(:recurring_stream, account: account, merchant: merchant, status: 'maybe')).not_to be_valid
    end

    it 'rejects unknown frequency' do
      expect(build(:recurring_stream, account: account, merchant: merchant, frequency: 'daily')).not_to be_valid
    end

    it 'requires amount_signature' do
      expect(build(:recurring_stream, account: account, merchant: merchant, amount_signature: nil)).not_to be_valid
    end

    it 'enforces unique identity at the database level' do
      create(:recurring_stream, account: account, merchant: merchant, frequency: 'monthly', amount_signature: '15.99')
      duplicate = build(:recurring_stream, account: account, merchant: merchant, frequency: 'monthly', amount_signature: '15.99')
      expect { duplicate.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe '#confirm!' do
    it 'sets status and flags linked transactions recurring' do
      stream = create(:recurring_stream, account: account, merchant: merchant)
      transaction = create(:plaid_transaction, account: account, merchant: merchant, recurring_stream: stream)

      stream.confirm!

      expect(stream.reload.status).to eq('confirmed')
      expect(transaction.reload.recurring).to be(true)
    end
  end

  describe '#dismiss!' do
    it 'sets status, unflags transactions, and keeps stream links' do
      stream = create(:recurring_stream, :confirmed, account: account, merchant: merchant)
      transaction = create(:plaid_transaction, account: account, merchant: merchant,
        recurring_stream: stream, recurring: true)

      stream.dismiss!

      expect(stream.reload.status).to eq('dismissed')
      transaction.reload
      expect(transaction.recurring).to be(false)
      expect(transaction.recurring_stream_id).to eq(stream.id)
    end
  end
end
