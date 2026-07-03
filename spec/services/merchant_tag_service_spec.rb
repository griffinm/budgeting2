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

  def make_transaction(tag:, date:, amount:, target_account: account, **attrs)
    create(
      :plaid_transaction,
      account: target_account,
      merchant: create(:merchant, account: target_account),
      merchant_tag: tag,
      date: date,
      amount: amount,
      **attrs,
    )
  end

  describe '#monthly_spend_stats_for_all_tags' do
    it 'buckets spend by month per tag' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2026, 3, 15), amount: 25.00)
      make_transaction(tag: tag, date: Date.new(2026, 3, 20), amount: 10.00)
      make_transaction(tag: tag, date: Date.new(2026, 4, 5), amount: 40.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: tag.id, year: 2026, month: 3, total_amount: 35.00 },
        { tag_id: tag.id, year: 2026, month: 4, total_amount: 40.00 },
      )
    end

    it 'rolls descendant spend up into ancestors' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)
      make_transaction(tag: child, date: Date.new(2026, 5, 10), amount: 60.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: child.id, year: 2026, month: 5, total_amount: 60.00 },
        { tag_id: parent.id, year: 2026, month: 5, total_amount: 60.00 },
      )
    end

    it 'excludes income and transfer transactions from expense tag spend' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2026, 3, 15), amount: 25.00)
      make_transaction(tag: tag, date: Date.new(2026, 3, 16), amount: -2000.00, transaction_type: 'income')
      make_transaction(tag: tag, date: Date.new(2026, 3, 17), amount: 500.00, transaction_type: 'transfer')

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: tag.id, year: 2026, month: 3, total_amount: 25.00 },
      )
    end

    it 'reports received income as positive on income tags, excluding expense rows' do
      income_tag = make_tag(tag_type: 'income')
      make_transaction(tag: income_tag, date: Date.new(2026, 3, 15), amount: -1000.00, transaction_type: 'income')
      make_transaction(tag: income_tag, date: Date.new(2026, 3, 20), amount: -500.00, transaction_type: 'income')
      make_transaction(tag: income_tag, date: Date.new(2026, 3, 21), amount: 40.00) # expense row, excluded

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: income_tag.id, year: 2026, month: 3, total_amount: 1500.00 },
      )
    end

    it 'nets refunds against spend' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2026, 3, 15), amount: 40.00)
      make_transaction(tag: tag, date: Date.new(2026, 3, 20), amount: -10.00) # refund: expense-typed, negative

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: tag.id, year: 2026, month: 3, total_amount: 30.00 },
      )
    end

    it 'excludes transactions outside the date range' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2025, 12, 31), amount: 100.00)
      make_transaction(tag: tag, date: Date.new(2026, 7, 2), amount: 100.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to be_empty
    end

    it 'includes transactions on the range boundaries' do
      tag = make_tag
      make_transaction(tag: tag, date: start_date, amount: 10.00)
      make_transaction(tag: tag, date: end_date, amount: 20.00)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results.sum { |r| r[:total_amount] }).to eq(30.00)
    end

    it 'only includes tags belonging to the account' do
      other_account = create(:account)
      other_user = create(:user, account: other_account)
      other_tag = create(:merchant_tag, account: other_account, user: other_user)
      make_transaction(tag: other_tag, date: Date.new(2026, 3, 15), amount: 25.00, target_account: other_account)

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to be_empty
    end
  end

  describe '#spend_stats_for_all_tags' do
    it 'sums spend within the range, rolled up into ancestors' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)
      make_transaction(tag: child, date: Date.new(2026, 3, 15), amount: 25.00)
      make_transaction(tag: child, date: Date.new(2026, 4, 15), amount: 15.00)

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      child_row = results.find { |r| r[:id] == child.id }
      parent_row = results.find { |r| r[:id] == parent.id }
      expect(child_row[:total_transaction_amount]).to eq(40.00)
      expect(parent_row[:total_transaction_amount]).to eq(40.00)
    end

    it 'excludes income and transfers and nets refunds' do
      tag = make_tag
      make_transaction(tag: tag, date: Date.new(2026, 3, 15), amount: 40.00)
      make_transaction(tag: tag, date: Date.new(2026, 3, 16), amount: -10.00) # refund
      make_transaction(tag: tag, date: Date.new(2026, 3, 17), amount: -2000.00, transaction_type: 'income')
      make_transaction(tag: tag, date: Date.new(2026, 3, 18), amount: 500.00, transaction_type: 'transfer')

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      row = results.find { |r| r[:id] == tag.id }
      expect(row[:total_transaction_amount]).to eq(30.00)
    end

    it 'handles an expense tree and an income tree simultaneously' do
      expense_root = make_tag
      expense_child = make_tag(parent_merchant_tag: expense_root)
      income_root = make_tag(tag_type: 'income')
      income_child = make_tag(parent_merchant_tag: income_root)

      make_transaction(tag: expense_child, date: Date.new(2026, 3, 15), amount: 75.00)
      make_transaction(tag: income_child, date: Date.new(2026, 3, 16), amount: -1200.00, transaction_type: 'income')

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results.find { |r| r[:id] == expense_root.id }[:total_transaction_amount]).to eq(75.00)
      expect(results.find { |r| r[:id] == expense_child.id }[:total_transaction_amount]).to eq(75.00)
      expect(results.find { |r| r[:id] == income_root.id }[:total_transaction_amount]).to eq(1200.00)
      expect(results.find { |r| r[:id] == income_child.id }[:total_transaction_amount]).to eq(1200.00)
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

  describe '#spend_stats_for_tag' do
    let(:current_month) { Date.today.beginning_of_month }
    let(:last_month) { current_month - 1.month }

    it 'sums expense spend per month for the tag and its descendants' do
      parent = make_tag
      child = make_tag(parent_merchant_tag: parent)
      make_transaction(tag: parent, date: last_month + 4.days, amount: 25.00)
      make_transaction(tag: child, date: last_month + 10.days, amount: 15.00)

      results = service.spend_stats_for_tag(tag_id: parent.id, months_back: 6)

      expect(results.sum { |r| r[:total_amount] }).to eq(40.00)
    end

    it 'excludes income and transfers and nets refunds' do
      tag = make_tag
      make_transaction(tag: tag, date: last_month + 4.days, amount: 40.00)
      make_transaction(tag: tag, date: last_month + 5.days, amount: -10.00) # refund
      make_transaction(tag: tag, date: last_month + 6.days, amount: -2000.00, transaction_type: 'income')
      make_transaction(tag: tag, date: last_month + 7.days, amount: 500.00, transaction_type: 'transfer')

      results = service.spend_stats_for_tag(tag_id: tag.id, months_back: 6)

      expect(results).to contain_exactly(
        { month: last_month.month, year: last_month.year, tag_id: tag.id, total_amount: 30.00 },
      )
    end

    it 'reports received income as positive for an income tag' do
      income_tag = make_tag(tag_type: 'income')
      make_transaction(tag: income_tag, date: last_month + 4.days, amount: -1000.00, transaction_type: 'income')
      make_transaction(tag: income_tag, date: last_month + 5.days, amount: 40.00) # expense row, excluded

      results = service.spend_stats_for_tag(tag_id: income_tag.id, months_back: 6)

      expect(results).to contain_exactly(
        { month: last_month.month, year: last_month.year, tag_id: income_tag.id, total_amount: 1000.00 },
      )
    end
  end

  describe 'split transaction exclusion' do
    let(:last_month) { Date.today.beginning_of_month - 1.month }

    def split_with_categorized_children(tag:, date:)
      parent = make_transaction(tag: tag, date: date, amount: 50.00)
      create(:plaid_transaction, :split_child, parent: parent, merchant_tag: tag, amount: 30.00)
      create(:plaid_transaction, :split_child, parent: parent, merchant_tag: tag, amount: 20.00)
      parent.update!(split: true)
    end

    it 'spend_stats_for_tag counts categorized children, not the split parent' do
      tag = make_tag
      split_with_categorized_children(tag: tag, date: last_month + 4.days)

      results = service.spend_stats_for_tag(tag_id: tag.id, months_back: 6)

      expect(results.sum { |r| r[:total_amount] }).to eq(50.00)
    end

    it 'spend_stats_for_all_tags counts categorized children, not the split parent' do
      tag = make_tag
      split_with_categorized_children(tag: tag, date: Date.new(2026, 3, 15))

      results = service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results.find { |r| r[:id] == tag.id }[:total_transaction_amount]).to eq(50.00)
    end

    it 'monthly_spend_stats_for_all_tags counts categorized children, not the split parent' do
      tag = make_tag
      split_with_categorized_children(tag: tag, date: Date.new(2026, 3, 15))

      results = service.monthly_spend_stats_for_all_tags(start_date: start_date, end_date: end_date)

      expect(results).to contain_exactly(
        { tag_id: tag.id, year: 2026, month: 3, total_amount: 50.00 },
      )
    end
  end
end
