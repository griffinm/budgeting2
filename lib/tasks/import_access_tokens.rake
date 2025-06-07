task import_access_tokens: :environment do
  puts "Importing access tokens"

  old_access_tokens = <<-SQL
    SELECT *
      FROM dblink('dbname=old_budgeting user=griffin',
                  'SELECT
                    id,
                    token,
                    created_at,
                    updated_at,
                    next_cursor
                  FROM access_tokens'
            )
            AS access_tokens(
              id TEXT,
              token TEXT,
              created_at TIMESTAMP,
              updated_at TIMESTAMP,
              next_cursor TEXT
            );
  SQL

  access_tokens = ActiveRecord::Base.connection.execute(old_access_tokens)
  puts "Importing #{access_tokens.count} access tokens"
  account = Account.first
  access_tokens.each do |access_token|
    PlaidAccessToken.create!(
      account: account,
      token: access_token["token"],
      created_at: access_token["created_at"],
      updated_at: access_token["updated_at"],
      next_cursor: access_token["next_cursor"]
    )
  end
end
