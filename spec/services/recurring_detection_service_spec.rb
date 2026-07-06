require 'rails_helper'

RSpec.describe RecurringDetectionService do
  let(:account) { create(:account) }
  let(:plaid_account) { create(:plaid_account, account: account) }
  let(:plaid_sync_event) { create(:plaid_sync_event, account: account) }
  let(:merchant) { create(:merchant, account: account) }

  def create_transaction(merchant:, amount:, date:, **attrs)
    create(:plaid_transaction,
      account: account, plaid_account: plaid_account, plaid_sync_event: plaid_sync_event,
      merchant: merchant, amount: amount, date: date, **attrs)
  end

  def create_series(merchant:, amount:, count:, interval:, start: nil, **attrs)
    start ||= ((count - 1) * interval).days.ago.to_date
    count.times.map do |i|
      create_transaction(merchant: merchant, amount: amount, date: start + (i * interval).days, **attrs)
    end
  end

  def run
    described_class.new(account_id: account.id).call
  end

  describe 'detection' do
    it 'detects a monthly fixed-amount subscription as a suggested stream' do
      transactions = create_series(merchant: merchant, amount: 15.99, count: 6, interval: 30)

      result = run

      expect(result).to eq(created: 1, updated: 0, skipped_dismissed: 0)
      stream = account.recurring_streams.sole
      expect(stream.status).to eq('suggested')
      expect(stream.frequency).to eq('monthly')
      expect(stream.average_amount).to be_within(0.01).of(15.99)
      expect(stream.amount_signature).to eq('15.99')
      expect(stream.occurrence_count).to eq(6)
      expect(stream.first_date).to eq(transactions.first.date.to_date)
      expect(stream.last_date).to eq(transactions.last.date.to_date)
      expect(stream.predicted_next_date).to eq(transactions.last.date.to_date + 30.days)
      expect(stream.active).to be(true)
      expect(stream.confidence).to be >= described_class::MIN_CONFIDENCE
      expect(transactions.map { |t| t.reload.recurring_stream_id }.uniq).to eq([stream.id])
      expect(transactions.map { |t| t.recurring }.uniq).to eq([false])
    end

    it 'groups amounts drifting within tolerance into one stream' do
      [100.0, 104.0, 96.0, 101.0].each_with_index do |amount, i|
        create_transaction(merchant: merchant, amount: amount, date: (90 - (30 * i)).days.ago.to_date)
      end

      expect { run }.to change(RecurringStream, :count).by(1)
    end

    it 'detects a weekly cadence' do
      create_series(merchant: merchant, amount: 12.0, count: 5, interval: 7)

      run

      expect(account.recurring_streams.sole.frequency).to eq('weekly')
    end

    it 'detects an annual cadence' do
      create_series(merchant: merchant, amount: 99.0, count: 3, interval: 365)

      run

      expect(account.recurring_streams.sole.frequency).to eq('annually')
    end

    it 'creates two streams for two distinct subscription amounts at one merchant' do
      create_series(merchant: merchant, amount: 9.99, count: 4, interval: 30)
      create_series(merchant: merchant, amount: 49.99, count: 4, interval: 30)

      run

      expect(account.recurring_streams.pluck(:amount_signature)).to contain_exactly('9.99', '49.99')
    end

    it 'detects a biweekly income paycheck' do
      create_series(merchant: merchant, amount: -2400.0, count: 5, interval: 14, transaction_type: 'income')

      run

      stream = account.recurring_streams.sole
      expect(stream.frequency).to eq('biweekly')
      expect(stream.average_amount).to be_within(0.01).of(-2400.0)
    end

    it 'ignores merchants with irregular activity' do
      [[13.0, 200], [77.5, 140], [8.25, 133], [150.0, 61], [42.0, 15]].each do |amount, days_ago|
        create_transaction(merchant: merchant, amount: amount, date: days_ago.days.ago.to_date)
      end

      expect { run }.not_to change(RecurringStream, :count)
    end

    it 'requires at least three occurrences' do
      create_series(merchant: merchant, amount: 15.99, count: 2, interval: 30)

      expect { run }.not_to change(RecurringStream, :count)
    end

    it 'excludes pending, split-parent, and transfer transactions' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30, pending: true)
      create_series(merchant: merchant, amount: 500.0, count: 4, interval: 30, transaction_type: 'transfer')
      create_series(merchant: merchant, amount: 50.0, count: 4, interval: 30, split: true)

      expect { run }.not_to change(RecurringStream, :count)
    end
  end

  describe 're-runs' do
    it 'is idempotent and refreshes stats when new transactions arrive' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30, start: 120.days.ago.to_date)

      first_result = run
      expect(first_result[:created]).to eq(1)

      second_result = run
      expect(second_result).to eq(created: 0, updated: 1, skipped_dismissed: 0)
      expect(RecurringStream.count).to eq(1)

      create_transaction(merchant: merchant, amount: 15.99, date: Date.current)
      run

      stream = account.recurring_streams.sole
      expect(stream.occurrence_count).to eq(5)
      expect(stream.last_date).to eq(Date.current)
    end

    it 'matches an existing stream through a price hike' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30, start: 120.days.ago.to_date)
      run

      create_transaction(merchant: merchant, amount: 17.99, date: Date.current)
      run

      stream = account.recurring_streams.sole
      expect(stream.amount_signature).to eq('15.99')
      expect(stream.last_amount).to eq(17.99)
    end

    it 'never resurrects or updates dismissed streams' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30, start: 120.days.ago.to_date)
      run
      stream = account.recurring_streams.sole
      stream.dismiss!
      snapshot = stream.reload.attributes

      new_transaction = create_transaction(merchant: merchant, amount: 15.99, date: Date.current)
      result = run

      expect(result[:skipped_dismissed]).to eq(1)
      expect(result[:created]).to eq(0)
      expect(RecurringStream.count).to eq(1)
      expect(stream.reload.attributes).to eq(snapshot)
      expect(new_transaction.reload.recurring_stream_id).to be_nil
      expect(new_transaction.recurring).to be(false)
    end

    it 'auto-flags new transactions joining a confirmed stream' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30, start: 120.days.ago.to_date)
      run
      stream = account.recurring_streams.sole
      stream.confirm!

      new_transaction = create_transaction(merchant: merchant, amount: 15.99, date: Date.current)
      run

      expect(stream.reload.status).to eq('confirmed')
      new_transaction.reload
      expect(new_transaction.recurring_stream_id).to eq(stream.id)
      expect(new_transaction.recurring).to be(true)
    end

    it 'marks lapsed streams inactive, including when no candidate cluster appears' do
      create_series(merchant: merchant, amount: 15.99, count: 4, interval: 30,
        start: (120 + 100).days.ago.to_date)
      run
      stream = account.recurring_streams.sole
      expect(stream.active).to be(false)

      # Simulate a stream whose transactions have aged out of the lookback window
      other_merchant = create(:merchant, account: account)
      stale = create(:recurring_stream, account: account, merchant: other_merchant,
        last_date: 4.years.ago.to_date, active: true)
      run
      expect(stale.reload.active).to be(false)
    end
  end
end
