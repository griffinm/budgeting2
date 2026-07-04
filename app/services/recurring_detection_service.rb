class RecurringDetectionService < BaseService
  LOOKBACK_MONTHS = 30
  MIN_OCCURRENCES = 3
  AMOUNT_TOLERANCE = 0.15
  IN_BUCKET_FRACTION = 0.7
  MIN_CONFIDENCE = 0.5
  CADENCE_BUCKETS = {
    "weekly" => 5..9,
    "biweekly" => 11..17,
    "monthly" => 26..35,
    "annually" => 350..380
  }.freeze
  PERIOD_DAYS = { "weekly" => 7, "biweekly" => 14, "monthly" => 30, "annually" => 365 }.freeze
  GRACE_DAYS = { "weekly" => 3, "biweekly" => 4, "monthly" => 7, "annually" => 30 }.freeze

  def initialize(account_id:)
    @account = Account.find(account_id)
    @counts = { created: 0, updated: 0, skipped_dismissed: 0 }
  end

  # Detection never writes status: streams are created as "suggested" and only
  # confirm!/dismiss! (user actions) move them. Dismissed streams are left
  # completely untouched so they can never be re-suggested.
  def call
    matched_stream_ids = []

    candidate_transactions.group_by { |t| [t.merchant_id, t.transaction_type] }.each do |(merchant_id, _type), group|
      amount_clusters(group).each do |cluster|
        stream = detect_stream(merchant_id, cluster)
        matched_stream_ids << stream.id if stream
      end
    end

    refresh_active_flags(except_ids: matched_stream_ids)
    @counts
  end

  def self.detect_safely(account_id:)
    new(account_id: account_id).call
  rescue => exception
    Rails.logger.error "RecurringDetection failed for account #{account_id}: #{exception.message}"
    nil
  end

  private

  def candidate_transactions
    @account.plaid_transactions
      .not_pending
      .not_split_parent
      .where(transaction_type: [PlaidTransaction::TRANSACTION_TYPES[:expense], PlaidTransaction::TRANSACTION_TYPES[:income]])
      .where(date: LOOKBACK_MONTHS.months.ago..)
      .select(:id, :merchant_id, :transaction_type, :amount, :date, :recurring_stream_id)
  end

  # Greedy clustering over amount-sorted transactions: a transaction joins the
  # current cluster while it stays within AMOUNT_TOLERANCE of the cluster
  # median, so a merchant with e.g. $9.99 and $49.99 subscriptions yields two
  # clusters. Works on signed amounts (income is negative).
  def amount_clusters(transactions)
    clusters = []
    transactions.sort_by(&:amount).each do |transaction|
      current = clusters.last
      if current && within_tolerance?(median(current.map(&:amount)), transaction.amount)
        current << transaction
      else
        clusters << [transaction]
      end
    end
    clusters
  end

  def detect_stream(merchant_id, cluster)
    return nil if cluster.size < MIN_OCCURRENCES

    dates = cluster.map { |t| t.date.to_date }.uniq.sort
    return nil if dates.size < MIN_OCCURRENCES

    gaps = dates.each_cons(2).map { |a, b| (b - a).to_i }
    median_gap = median(gaps)
    frequency, bucket = CADENCE_BUCKETS.find { |_freq, range| range.cover?(median_gap) }
    return nil unless frequency

    in_bucket_fraction = gaps.count { |gap| bucket.cover?(gap) } / gaps.size.to_f
    return nil if in_bucket_fraction < IN_BUCKET_FRACTION

    confidence = compute_confidence(cluster, in_bucket_fraction)
    return nil if confidence < MIN_CONFIDENCE

    upsert_stream(merchant_id, frequency, cluster, dates, confidence)
  end

  def compute_confidence(cluster, in_bucket_fraction)
    0.5 * in_bucket_fraction +
      0.3 * amount_consistency(cluster.map(&:amount)) +
      0.2 * [cluster.size / 6.0, 1.0].min
  end

  def amount_consistency(amounts)
    mean = amounts.sum / amounts.size.to_f
    return 0.0 if mean.zero?

    variance = amounts.sum { |a| (a - mean)**2 } / amounts.size.to_f
    coefficient_of_variation = Math.sqrt(variance) / mean.abs
    1.0 - [coefficient_of_variation / AMOUNT_TOLERANCE, 1.0].min
  end

  def upsert_stream(merchant_id, frequency, cluster, dates, confidence)
    cluster_median = median(cluster.map(&:amount))
    stream = matching_stream(merchant_id, frequency, cluster_median)

    if stream&.status == "dismissed"
      @counts[:skipped_dismissed] += 1
      return stream
    end

    if stream.nil?
      stream = create_stream(merchant_id, frequency, cluster_median)
    else
      @counts[:updated] += 1
    end

    last_transaction = cluster.max_by { |t| t.date.to_date }
    stream.update!(
      average_amount: cluster.sum(&:amount) / cluster.size.to_f,
      last_amount: last_transaction.amount,
      first_date: dates.first,
      last_date: dates.last,
      predicted_next_date: dates.last + PERIOD_DAYS[frequency],
      occurrence_count: cluster.size,
      confidence: confidence,
      active: lapse_date(frequency, dates.last) >= Date.current
    )

    link_transactions(stream, cluster)
    stream
  end

  def matching_stream(merchant_id, frequency, cluster_median)
    candidates = @account.recurring_streams.where(merchant_id: merchant_id, frequency: frequency, source: "heuristic")
    closest = candidates.min_by { |s| (s.average_amount - cluster_median).abs }
    return nil unless closest && within_tolerance?(closest.average_amount, cluster_median)

    closest
  end

  def create_stream(merchant_id, frequency, cluster_median)
    stream = @account.recurring_streams.create!(
      merchant_id: merchant_id,
      frequency: frequency,
      source: "heuristic",
      status: "suggested",
      amount_signature: format("%.2f", cluster_median)
    )
    @counts[:created] += 1
    stream
  rescue ActiveRecord::RecordNotUnique
    @counts[:updated] += 1
    @account.recurring_streams.find_by!(
      merchant_id: merchant_id, frequency: frequency, source: "heuristic",
      amount_signature: format("%.2f", cluster_median)
    )
  end

  def link_transactions(stream, cluster)
    newly_linked_ids = cluster.reject(&:recurring_stream_id).map(&:id)
    PlaidTransaction.where(id: cluster.map(&:id)).update_all(recurring_stream_id: stream.id)
    if stream.status == "confirmed" && newly_linked_ids.any?
      PlaidTransaction.where(id: newly_linked_ids).update_all(recurring: true)
    end
  end

  # Streams whose merchant produced no matching cluster this run (e.g. a
  # cancelled subscription that aged out of the lookback window) still need
  # their active flag recomputed.
  def refresh_active_flags(except_ids:)
    @account.recurring_streams.not_dismissed.where.not(id: except_ids).find_each do |stream|
      next if stream.last_date.nil?

      still_active = lapse_date(stream.frequency, stream.last_date) >= Date.current
      stream.update!(active: still_active) if stream.active != still_active
    end
  end

  def lapse_date(frequency, last_date)
    last_date + PERIOD_DAYS[frequency] + GRACE_DAYS[frequency]
  end

  def within_tolerance?(reference, value)
    return false if reference.nil?
    return value.zero? if reference.zero?

    (value - reference).abs <= AMOUNT_TOLERANCE * reference.abs
  end

  def median(values)
    sorted = values.sort
    sorted[sorted.size / 2]
  end
end
