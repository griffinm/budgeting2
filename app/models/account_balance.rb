class AccountBalance < ApplicationRecord
  belongs_to :plaid_account
  has_one :account, through: :plaid_account

  validates :current_balance, :available_balance, presence: true
  validates :limit, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }

  scope :current, -> { order(created_at: :desc).first }

  def self.current_for_account(account_id)
    sql = <<-SQL
      WITH most_recent_balances AS (
        SELECT
            ab.plaid_account_id AS id,
            MAX(ab.created_at)
          FROM
            account_balances ab INNER JOIN plaid_accounts pa ON ab.plaid_account_id = pa.id
          WHERE
            pa.account_id = :account_id
          GROUP BY
            ab.plaid_account_id
      )
      SELECT
          ab.*,
          pa.plaid_type
        FROM
          account_balances ab INNER JOIN most_recent_balances mrb ON ab.id = mrb.id
          INNER JOIN plaid_accounts pa ON pa.id = ab.plaid_account_id
      SQL

     AccountBalance.find_by_sql([sql, account_id: account_id])
  end
end