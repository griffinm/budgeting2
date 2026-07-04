class RecurringStream < ApplicationRecord
  SOURCES = %w[heuristic plaid].freeze
  STATUSES = %w[suggested confirmed dismissed].freeze
  FREQUENCIES = %w[weekly biweekly monthly annually].freeze

  belongs_to :account
  belongs_to :merchant
  has_many :plaid_transactions

  validates :source, inclusion: { in: SOURCES }
  validates :status, inclusion: { in: STATUSES }
  validates :frequency, inclusion: { in: FREQUENCIES }
  validates :amount_signature, presence: true

  scope :suggested, -> { where(status: "suggested") }
  scope :confirmed, -> { where(status: "confirmed") }
  scope :dismissed, -> { where(status: "dismissed") }
  scope :not_dismissed, -> { where.not(status: "dismissed") }

  def confirm!
    transaction do
      update!(status: "confirmed")
      plaid_transactions.update_all(recurring: true)
    end
  end

  # Keeps recurring_stream_id links so the stream's history stays intact and
  # detection re-runs still match this identity instead of recreating it.
  def dismiss!
    transaction do
      update!(status: "dismissed")
      plaid_transactions.update_all(recurring: false)
    end
  end
end
