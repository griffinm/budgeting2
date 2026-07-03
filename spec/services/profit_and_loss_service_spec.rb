require 'rails_helper'

RSpec.describe ProfitAndLossService do
  include ActiveSupport::Testing::TimeHelpers

  let(:account) { create(:account) }
  let(:user) { create(:user, account: account, time_zone: 'Eastern Time (US & Canada)') }
  let(:plaid_access_token) { create(:plaid_access_token, account: account) }
  let(:plaid_account) { create(:plaid_account, account: account, plaid_access_token: plaid_access_token) }

  def create_transaction(date:, amount:, type: 'expense', pending: false)
    create(
      :plaid_transaction,
      account: account,
      plaid_account: plaid_account,
      date: date,
      amount: amount,
      transaction_type: type,
      pending: pending,
    )
  end

  def call(months_back: 12)
    described_class.new(user_id: user.id).profit_and_loss(months_back: months_back)
  end

  # Pin "today" to a fixed mid-month ET moment so months_back math is deterministic.
  # 2026-04-15 12:00 ET == 2026-04-15 16:00 UTC.
  around do |example|
    travel_to(Time.utc(2026, 4, 15, 16, 0, 0)) { example.run }
  end

  describe 'month range coverage' do
    it 'returns months_back + 1 buckets covering the full window' do
      result = call(months_back: 12)

      expect(result.length).to eq(13)
      expect(result.first.slice(:year, :month)).to eq(year: 2025, month: 4)
      expect(result.last.slice(:year, :month)).to eq(year: 2026, month: 4)
    end

    it 'includes empty months as zero buckets so no month is dropped' do
      # Only one transaction in the entire window
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2025, 8, 10, 12, 0) },
        amount: 100,
      )

      result = call(months_back: 12)

      expect(result.length).to eq(13)
      empty = result.find { |m| m[:year] == 2025 && m[:month] == 4 }
      expect(empty[:expense]).to eq(0)
      expect(empty[:income]).to eq(0)
    end
  end

  describe 'first month bucket (regression)' do
    it 'aggregates the entire calendar month, not just the days from N months ago to month-end' do
      # Two transactions inside the oldest month — one near the start, one near the end.
      # The buggy version filtered "Date.today - 12.months" which would exclude day 1.
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2025, 4, 1, 9, 0) },
        amount: 30,
      )
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2025, 4, 28, 9, 0) },
        amount: 70,
      )

      result = call(months_back: 12)
      first_month = result.first

      expect(first_month[:year]).to eq(2025)
      expect(first_month[:month]).to eq(4)
      expect(first_month[:expense]).to eq(100)
    end
  end

  describe 'timezone-aware bucketing' do
    it 'attributes a 11:30pm ET transaction on the last of the month to that month, not the next' do
      # 2025-05-31 23:30 ET == 2025-06-01 03:30 UTC.
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2025, 5, 31, 23, 30) },
        amount: 250,
      )

      result = call(months_back: 12)

      may_2025 = result.find { |m| m[:year] == 2025 && m[:month] == 5 }
      jun_2025 = result.find { |m| m[:year] == 2025 && m[:month] == 6 }

      expect(may_2025[:expense]).to eq(250)
      expect(jun_2025[:expense]).to eq(0)
    end
  end

  describe 'income vs expense' do
    it 'sums income and expense separately and computes profit' do
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 10, 12, 0) },
        amount: 200,
        type: 'expense',
      )
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 15, 12, 0) },
        amount: -1000,
        type: 'income',
      )

      result = call(months_back: 12)
      march = result.find { |m| m[:year] == 2026 && m[:month] == 3 }

      expect(march[:expense]).to eq(200)
      expect(march[:income]).to eq(1000)
      expect(march[:profit]).to eq(800)
    end

    it 'nets refunds against expenses instead of adding them' do
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 10, 12, 0) },
        amount: 100,
        type: 'expense',
      )
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 12, 12, 0) },
        amount: -30, # refund: expense-typed, negative
        type: 'expense',
      )

      result = call(months_back: 12)
      march = result.find { |m| m[:year] == 2026 && m[:month] == 3 }

      expect(march[:expense]).to eq(70)
    end

    it 'excludes pending transactions' do
      create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 10, 12, 0) },
        amount: 999,
        pending: true,
      )

      result = call(months_back: 12)
      march = result.find { |m| m[:year] == 2026 && m[:month] == 3 }

      expect(march[:expense]).to eq(0)
    end

    it 'counts split children once, not the parent' do
      parent = create_transaction(
        date: Time.use_zone(user.time_zone) { Time.zone.local(2026, 3, 10, 12, 0) },
        amount: 100,
      )
      create(:plaid_transaction, :split_child, parent: parent, amount: 60)
      create(:plaid_transaction, :split_child, parent: parent, amount: 40)
      parent.update!(split: true)

      result = call(months_back: 12)
      march = result.find { |m| m[:year] == 2026 && m[:month] == 3 }

      expect(march[:expense]).to eq(100)
    end
  end
end
