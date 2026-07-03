require 'rails_helper'

RSpec.describe MerchantGroupSpendService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:merchant) { create(:merchant, account: account) }
  let(:sibling) { create(:merchant, account: account, merchant_name: 'Sibling') }
  let(:group) do
    group = MerchantGroup.create!(account: account, name: 'Group', primary_merchant_id: merchant.id)
    group.add_merchant(merchant)
    group.add_merchant(sibling)
    group
  end
  let(:service) { described_class.new(merchant_group_id: group.id, current_user: user) }

  let(:last_month) { Date.today.beginning_of_month - 1.month }
  let(:month_key) { last_month.strftime('%Y-%m') }

  def make_transaction(merchant:, amount:, **attrs)
    create(:plaid_transaction, account: account, merchant: merchant, amount: amount, date: last_month + 4.days, **attrs)
  end

  it 'sums spend and income across the group under the type convention' do
    make_transaction(merchant: merchant, amount: 40.00)
    make_transaction(merchant: sibling, amount: -10.00) # refund
    make_transaction(merchant: merchant, amount: -2000.00, transaction_type: 'income')
    make_transaction(merchant: sibling, amount: 500.00, transaction_type: 'transfer')

    expect(service.all_time_spend).to eq(30.00)
    expect(service.all_time_income).to eq(2000.00)

    spend_entry = service.monthly_spend(months_back: 3).find { |r| r[:month] == month_key }
    income_entry = service.monthly_income(months_back: 3).find { |r| r[:month] == month_key }
    expect(spend_entry[:amount]).to eq(30.00)
    expect(income_entry[:amount]).to eq(2000.00)
  end
end
