require 'rails_helper'

RSpec.describe TagService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:service) { described_class.new(account_id: account.id, user_id: user.id) }

  let(:current_month) { Date.today.beginning_of_month }
  let(:last_month) { current_month - 1.month }

  def make_tag(**attrs)
    create(:tag, account: account, user: user, **attrs)
  end

  def tag_transaction(tag:, date:, amount:, **attrs)
    transaction = create(
      :plaid_transaction,
      account: account,
      merchant: create(:merchant, account: account),
      date: date,
      amount: amount,
      **attrs,
    )
    create(:tag_plaid_transaction, tag: tag, plaid_transaction: transaction, user: user)
    transaction
  end

  describe '#spend_stats' do
    it 'sums tagged expense spend by month' do
      tag = make_tag
      tag_transaction(tag: tag, date: last_month + 4.days, amount: 25.00)
      tag_transaction(tag: tag, date: last_month + 10.days, amount: 15.00)

      results = service.spend_stats(tag_ids: [tag.id], months_back: 6)

      expect(results).to contain_exactly(
        { month: last_month.month, year: last_month.year, tag_id: tag.id, total_amount: 40.00 },
      )
    end

    it 'excludes income and transfers and nets refunds' do
      tag = make_tag
      tag_transaction(tag: tag, date: last_month + 4.days, amount: 40.00)
      tag_transaction(tag: tag, date: last_month + 5.days, amount: -10.00) # refund
      tag_transaction(tag: tag, date: last_month + 6.days, amount: -2000.00, transaction_type: 'income')
      tag_transaction(tag: tag, date: last_month + 7.days, amount: 500.00, transaction_type: 'transfer')

      results = service.spend_stats(tag_ids: [tag.id], months_back: 6)

      expect(results).to contain_exactly(
        { month: last_month.month, year: last_month.year, tag_id: tag.id, total_amount: 30.00 },
      )
    end

    it 'omits transactions carrying an omitted tag' do
      tag = make_tag
      omitted_tag = make_tag
      kept = tag_transaction(tag: tag, date: last_month + 4.days, amount: 25.00)
      omitted = tag_transaction(tag: tag, date: last_month + 5.days, amount: 50.00)
      create(:tag_plaid_transaction, tag: omitted_tag, plaid_transaction: omitted, user: user)

      results = service.spend_stats(tag_ids: [tag.id], months_back: 6, omit_tag_ids: [omitted_tag.id])

      expect(results).to contain_exactly(
        { month: last_month.month, year: last_month.year, tag_id: tag.id, total_amount: 25.00 },
      )
    end

    it 'returns an empty array without tag ids' do
      expect(service.spend_stats(tag_ids: [])).to eq([])
    end
  end
end
