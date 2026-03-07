class TagService < BaseService
  def initialize(account_id:, user_id:)
    @account = Account.find(account_id)
    @user = User.find(user_id)

    if @account.nil?
      raise "Account with id #{account_id} not found"
    end
  end

  def spend_stats(tag_ids:, months_back: 6, omit_tag_ids: nil)
    return [] if tag_ids.blank?

    end_date = Date.today.end_of_day
    start_date = Date.today.beginning_of_month - (months_back.to_i - 1).months

    sanitized_tag_ids = tag_ids.map(&:to_i).join(',')

    omit_clause = ""
    if omit_tag_ids.present? && omit_tag_ids.is_a?(Array) && omit_tag_ids.any?
      sanitized_omit_ids = omit_tag_ids.map(&:to_i).join(',')
      omit_clause = <<-SQL
        AND pt.id NOT IN (
          SELECT plaid_transaction_id FROM tag_plaid_transactions WHERE tag_id IN (#{sanitized_omit_ids})
        )
      SQL
    end

    sql = <<-SQL
      SELECT
        EXTRACT(MONTH FROM pt.date) AS month,
        EXTRACT(YEAR FROM pt.date) AS year,
        tpt.tag_id AS tag_id,
        ROUND(SUM(ABS(pt.amount))::NUMERIC, 2) AS total_amount
      FROM
        tag_plaid_transactions tpt
        INNER JOIN plaid_transactions pt ON tpt.plaid_transaction_id = pt.id
        INNER JOIN tags t ON tpt.tag_id = t.id
      WHERE
        t.account_id = #{ActiveRecord::Base.connection.quote(@account.id)}
        AND tpt.tag_id IN (#{sanitized_tag_ids})
        AND pt.date >= #{ActiveRecord::Base.connection.quote(start_date)}
        AND pt.date <= #{ActiveRecord::Base.connection.quote(end_date)}
        #{omit_clause}
      GROUP BY
        year, month, tag_id
      ORDER BY
        year ASC, month ASC
    SQL

    ActiveRecord::Base.connection.execute(sql).to_a.map do |row|
      {
        month: row['month'].to_i,
        year: row['year'].to_i,
        tag_id: row['tag_id'].to_i,
        total_amount: (row['total_amount'] || 0).to_f
      }
    end
  end
end
