class MerchantTagService < BaseService
  def initialize(account_id:, user_id:)
    @account = Account.find(account_id)
    @user = User.find(user_id)

    if @account.nil?
      raise "Account with id #{account_id} not found"
    end
  end

  def spend_stats_for_all_tags(start_date:, end_date:)
    @start_date = start_date
    @end_date = end_date

    ActiveRecord::Base.connection.execute(query).to_a.map do |row|
      {
        id: row['id'],
        name: row['name'],
        parent_id: row['parent_merchant_tag_id'],
        total_transaction_amount: (row['total_transaction_amount'] || 0).to_f
      }
    end
  end

  def monthly_spend_stats_for_all_tags(start_date:, end_date:)
    sanitized_start_date = ActiveRecord::Base.connection.quote(start_date.to_date)
    sanitized_end_date = ActiveRecord::Base.connection.quote(end_date.to_date)

    sql = <<-SQL
      WITH RECURSIVE tag_tree AS (
        -- Start with each of the account's tags as its own root
        SELECT
          id AS root_tag_id,
          id AS descendant_tag_id
        FROM merchant_tags
        WHERE account_id = #{@account.id.to_i}

        UNION ALL

        -- Add child tags recursively
        SELECT
          tt.root_tag_id,
          mt.id AS descendant_tag_id
        FROM tag_tree tt
        JOIN merchant_tags mt
          ON mt.parent_merchant_tag_id = tt.descendant_tag_id
      ),

      tagged_transactions AS (
        -- Type-aware convention: expense tags sum signed spend (refunds net
        -- out); income tags sum received income as a positive number (Plaid
        -- stores income negative). A transaction counts only when its type
        -- matches its own tag's type — descendants always share the root's
        -- type, so the rollup stays single-orientation.
        SELECT
          t.merchant_tag_id AS merchant_tag_id,
          EXTRACT(MONTH FROM t.date) AS month,
          EXTRACT(YEAR FROM t.date) AS year,
          CASE WHEN tag.tag_type = 'income' THEN -t.amount ELSE t.amount END AS amount
        FROM
          merchants m
          INNER JOIN plaid_transactions t ON t.merchant_id = m.id
          INNER JOIN merchant_tags tag ON tag.id = t.merchant_tag_id
        WHERE
          t.date <= #{sanitized_end_date}
        AND t.date >= #{sanitized_start_date}
        AND t.transaction_type = tag.tag_type
      )

      -- Roll descendant spend up into each ancestor, bucketed by month
      SELECT
          tt.root_tag_id AS tag_id,
          ttx.year,
          ttx.month,
          ROUND(SUM(ttx.amount)::NUMERIC, 2) AS total_amount
        FROM tag_tree tt
        JOIN tagged_transactions ttx
          ON ttx.merchant_tag_id = tt.descendant_tag_id
        GROUP BY tt.root_tag_id, ttx.year, ttx.month
        ORDER BY ttx.year ASC, ttx.month ASC;
    SQL

    ActiveRecord::Base.connection.execute(sql).to_a.map do |row|
      {
        tag_id: row['tag_id'].to_i,
        year: row['year'].to_i,
        month: row['month'].to_i,
        total_amount: (row['total_amount'] || 0).to_f,
      }
    end
  end

  def spend_stats_for_tag(tag_id:, months_back: 6)
    child_ids = @user.account.merchant_tags.find(tag_id).child_ids
    end_date = Date.today.beginning_of_month
    start_date = end_date - months_back.to_i.months

    sql = <<-SQL
      SELECT
          EXTRACT(MONTH FROM pt.date) AS month,
          EXTRACT(YEAR FROM pt.date) AS year,
          mt.id AS tag_id,
          -- Type-aware convention: income tags report received income as a
          -- positive number; expense tags report signed spend
          SUM(CASE WHEN mt.tag_type = 'income' THEN -pt.amount ELSE pt.amount END) AS total_amount
        FROM
            merchant_tags mt INNER JOIN plaid_transactions pt ON mt.id = pt.merchant_tag_id
        WHERE
            (mt.id = #{tag_id} OR pt.merchant_tag_id IN (#{child_ids.join(',')}))
            AND pt.date >= #{ActiveRecord::Base.connection.quote(start_date)}
            AND pt.date < #{ActiveRecord::Base.connection.quote(end_date)}
            AND pt.transaction_type = mt.tag_type
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

  private def query
    sanitized_start_date = @start_date&.to_date || '2025-05-01'
    sanitized_end_date = @end_date&.to_date || '2025-07-01'

    <<-SQL
      WITH RECURSIVE tag_tree AS (
        -- Start with each of the account's tags as its own root
        SELECT
          id AS root_tag_id,
          id AS descendant_tag_id
        FROM merchant_tags
        WHERE account_id = #{@account.id.to_i}

        UNION ALL

        -- Add child tags recursively
        SELECT 
          tt.root_tag_id,
          mt.id AS descendant_tag_id
        FROM tag_tree tt
        JOIN merchant_tags mt 
          ON mt.parent_merchant_tag_id = tt.descendant_tag_id
      ),

      tagged_transactions AS (
        -- Type-aware convention: expense tags sum signed spend (refunds net
        -- out); income tags sum received income as a positive number (Plaid
        -- stores income negative). A transaction counts only when its type
        -- matches its own tag's type — descendants always share the root's
        -- type, so the rollup stays single-orientation.
        SELECT
          t.merchant_tag_id AS merchant_tag_id,
          CASE WHEN tag.tag_type = 'income' THEN -t.amount ELSE t.amount END AS amount
        FROM
          merchants m
          INNER JOIN plaid_transactions t ON t.merchant_id = m.id
          INNER JOIN merchant_tags tag ON tag.id = t.merchant_tag_id
        WHERE
          t.date <= #{ActiveRecord::Base.connection.quote(sanitized_end_date)}
        AND t.date >= #{ActiveRecord::Base.connection.quote(sanitized_start_date)}
        AND t.transaction_type = tag.tag_type
      ),

      rolled_up AS (
        -- Join tag hierarchy with tagged transactions and sum amounts
        SELECT 
          tt.root_tag_id AS merchant_tag_id,
          ROUND(SUM(ttx.amount)::NUMERIC, 2) AS total_amount
        FROM tag_tree tt
        JOIN tagged_transactions ttx 
          ON ttx.merchant_tag_id = tt.descendant_tag_id
        GROUP BY tt.root_tag_id
      )

      -- Final output
      SELECT
          mt.id,
          mt.name,
          mt.parent_merchant_tag_id,
          COALESCE(ru.total_amount, 0) AS total_transaction_amount
        FROM
          merchant_tags mt LEFT JOIN rolled_up ru ON mt.id = ru.merchant_tag_id
        WHERE mt.account_id = #{@account.id.to_i}
        ORDER BY mt.id;
    SQL
  end
end
