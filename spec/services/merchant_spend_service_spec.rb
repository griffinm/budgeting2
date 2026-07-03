require 'rails_helper'

RSpec.describe MerchantSpendService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:service) { described_class.new(merchant: merchant, current_user: user) }

  let(:last_month) { Date.today.beginning_of_month - 1.month }
  let(:month_key) { last_month.strftime('%Y-%m') }

  def make_transaction(merchant:, amount:, date: last_month + 4.days, **attrs)
    create(:plaid_transaction, account: account, merchant: merchant, amount: amount, date: date, **attrs)
  end

  describe '#all_time_spend' do
    it 'sums expenses only, netting refunds' do
      make_transaction(merchant: merchant, amount: 40.00)
      make_transaction(merchant: merchant, amount: -10.00) # refund
      make_transaction(merchant: merchant, amount: -2000.00, transaction_type: 'income')
      make_transaction(merchant: merchant, amount: 500.00, transaction_type: 'transfer')

      expect(service.all_time_spend).to eq(30.00)
    end
  end

  describe '#monthly_spend' do
    it 'buckets expense spend by month, excluding income and transfers' do
      make_transaction(merchant: merchant, amount: 40.00)
      make_transaction(merchant: merchant, amount: -10.00) # refund
      make_transaction(merchant: merchant, amount: -2000.00, transaction_type: 'income')

      results = service.monthly_spend(months_back: 3)

      entry = results.find { |r| r[:month] == month_key }
      expect(entry[:amount]).to eq(30.00)
      expect(results.sum { |r| r[:amount] }).to eq(30.00)
    end

    it 'includes group merchants when requested' do
      sibling = create(:merchant, account: account, merchant_name: 'Sibling')
      group = MerchantGroup.create!(account: account, name: 'Group', primary_merchant_id: merchant.id)
      group.add_merchant(merchant)
      group.add_merchant(sibling)

      make_transaction(merchant: merchant, amount: 25.00)
      make_transaction(merchant: sibling, amount: 15.00)
      make_transaction(merchant: sibling, amount: -3000.00, transaction_type: 'income')

      results = service.monthly_spend(months_back: 3, include_group: true)

      entry = results.find { |r| r[:month] == month_key }
      expect(entry[:amount]).to eq(40.00)
    end
  end
end
