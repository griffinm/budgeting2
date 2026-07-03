require 'rails_helper'

RSpec.describe MerchantTagService do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:service) { described_class.new(account_id: account.id, user_id: user.id) }

  let(:start_date) { Date.new(2026, 1, 1) }
  let(:end_date) { Date.new(2026, 7, 1) }

  def make_tag(**attrs)
    create(:merchant_tag, account: account, user: user, **attrs)
  end

  def make_transaction(tag:, date:, amount:, target_account: account)
    create(
      :plaid_transaction,
      account: target_account,
      merchant: create(:merchant, account: target_account),
      merchant_tag: tag,
      date: date,
      amount: amount,
    )
  end

  describe '#monthly_spend_stats_for_all_tags' do
    it 'buckets spend by month per tag' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2026, 3, 15), amount: -25.00)
      make_transaction(tag: tag, date: Date.new(2026, 3, 20), amount: -10.00)
      make_transaction(tag: tag, date: Date.new(2026, 4, 5), amount: -40.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: tag.id, year: 2026, month: 3, total_amount: 35.00 },
        { tag_id: tag.id, year: 2026, month: 4, total_amount: 40.00 },
      )
    end

    it 'rolls descendant spend up into ancestors' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)
      make_transaction(tag: child, date: Date.new(2026, 5, 10), amount: -60.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: child.id, year: 2026, month: 5, total_amount: 60.00 },
        { tag_id: parent.id, year: 2026, month: 5, total_amount: 60.00 },
      )
    end

    it 'excludes transactions outside the date range' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2025, 12, 31), amount: -100.00)
      make_transaction(tag: tag, date: Date.new(2026, 7, 2), amount: -100.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to be_empty
    end

    it 'includes transactions on the range boundaries' do
      tag = make_tag
      make_transaction(tag: tag, date: start_date, amount: -10.00)
      make_transaction(tag: tag, date: end_date, amount: -20.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results.sum { |r| r[:total_amount] }).to eq(30.00)
    end

    it 'only includes tags belonging to the account' do
      other_account = create(:account)
      other_user = create(:user, account: other_account)
      other_tag = create(:merchant_tag, account: other_account, user: other_user)
      make_transaction(tag: other_tag, date: Date.new(2026, 3, 15), amount: -25.00, target_account: other_account)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to be_empty
    end
  end

  describe '#spend_stats_for_all_tags' do
    it 'sums spend within the range, rolled up into ancestors' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)
      make_transaction(tag: child, date: Date.new(2026, 3, 15), amount: -25.00)
      make_transaction(tag: child, date: Date.new(2026, 4, 15), amount: -15.00)

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      child_row = results.find { |r| r[:id] == child.id }
      parent_row = results.find { |r| r[:id] == parent.id }
      expect(child_row[:total_transaction_amount]).to eq(40.00)
      expect(parent_row[:total_transaction_amount]).to eq(40.00)
    end

    it 'only includes tags belonging to the account' do
      other_account = create(:account)
      other_user = create(:user, account: other_account)
      create(:merchant_tag, account: other_account, user: other_user)
      mine = make_tag

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results.map { |r| r[:id] }).to contain_exactly(mine.id)
    end
  end
end
