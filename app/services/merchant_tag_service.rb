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
        parent_id: row['parent_id'],
        total_transaction_amount: (row['total_transaction_amount'] || 0).to_f
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
          SUM(pt.amount) AS total_amount
        FROM
            merchant_tags mt INNER JOIN plaid_transactions pt ON mt.id = pt.merchant_tag_id
        WHERE
            (mt.id = #{tag_id} OR pt.merchant_tag_id IN (#{child_ids.join(',')}))
            AND pt.date >= #{ActiveRecord::Base.connection.quote(start_date)}
            AND pt.date < #{ActiveRecord::Base.connection.quote(end_date)}
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
        total_amount: (row['total_amount'] || 0).abs.to_f
      }
    end
  end

  private def query
    sanitized_start_date = @start_date&.to_date || '2025-05-01'
    sanitized_end_date = @end_date&.to_date || '2025-07-01'

    <<-SQL
      WITH RECURSIVE tag_tree AS (
        -- Start with each tag as its own root
        SELECT 
          id AS root_tag_id,
          id AS descendant_tag_id
        FROM merchant_tags

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
        -- Join tags to merchants, and merchants to transactions
        SELECT 
          t.merchant_tag_id AS merchant_tag_id,
          ABS(t.amount) AS amount
        FROM
          merchants m INNER JOIN plaid_transactions t ON t.merchant_id = m.id
        WHERE 
          t.date < #{ActiveRecord::Base.connection.quote(sanitized_end_date)}
        AND t.date > #{ActiveRecord::Base.connection.quote(sanitized_start_date)}
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
        ORDER BY mt.id;
    SQL
  end
end
