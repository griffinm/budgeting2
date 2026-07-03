require 'rails_helper'

RSpec.describe MonthlySpendService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }
  let(:service) { described_class.new(user.id) }

  let(:sample_date) { Date.today - 10.days }

  before do
    create(:plaid_accounts_user, user: user, plaid_account: plaid_account)
  end

  def make_transaction(amount:, date: sample_date, **attrs)
    create(:plaid_transaction, account: account, plaid_account: plaid_account, amount: amount, date: date, **attrs)
  end

  describe '#moving_average' do
    it 'returns positive magnitudes for income' do
      make_transaction(amount: -600.00, transaction_type: 'income')

      result = service.moving_average(months_back: 6, transaction_type: 'income')

      entry = result.find { |r| r[:dayOfMonth] == sample_date.day }
      expect(entry[:dayAverage]).to eq(100.0)
      expect(entry[:cumulativeTotal]).to eq(100.0)
    end

    it 'nets refunds against expense spend' do
      make_transaction(amount: 40.00)
      make_transaction(amount: -10.00) # refund

      result = service.moving_average(months_back: 6, transaction_type: 'expense')

      entry = result.find { |r| r[:dayOfMonth] == sample_date.day }
      expect(entry[:dayAverage]).to eq(5.0)
    end

    it 'raises on an invalid transaction type' do
      expect {
        service.moving_average(transaction_type: 'delete_all')
      }.to raise_error(ArgumentError, /Invalid transaction type/)
    end
  end
end
