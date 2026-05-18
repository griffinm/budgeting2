class PlaidAccessToken < ApplicationRecord
  belongs_to :account
  has_many :plaid_accounts, dependent: :destroy

  STATUSES = {
    active: "active",
    login_required: "login_required",
    error: "error"
  }.freeze

  # Plaid item error codes that mean the user must re-authenticate the Item
  # via Link update mode before syncing can resume.
  REAUTH_ERROR_CODES = %w[
    ITEM_LOGIN_REQUIRED
    PENDING_EXPIRATION
    PENDING_DISCONNECT
    USER_PERMISSION_REVOKED
    USER_ACCOUNT_REVOKED
  ].freeze

  validates :status, inclusion: { in: STATUSES.values }

  scope :healthy, -> { where(status: STATUSES[:active]) }
  scope :needs_attention, -> { where.not(status: STATUSES[:active]) }

  def healthy?
    status == STATUSES[:active]
  end

  def needs_reconnect?
    status == STATUSES[:login_required]
  end

  # Record a Plaid item error against this token. Reauth-class errors flag the
  # Item for Link update mode; everything else is a transient/server error.
  def mark_error!(error_code)
    new_status = REAUTH_ERROR_CODES.include?(error_code) ? STATUSES[:login_required] : STATUSES[:error]
    update!(status: new_status, error_code: error_code, last_error_at: Time.current)
  end

  def mark_healthy!
    update!(status: STATUSES[:active], error_code: nil, last_synced_at: Time.current)
  end
end
