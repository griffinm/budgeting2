task import_plaid_accounts: :environment do
  puts "Importing plaid accounts"

  old_plaid_accounts = <<-SQL
    SELECT *
      FROM dblink('dbname=old_budgeting user=griffin',
                  'SELECT
				  	         id,
                     plaid_mask,
                     plaid_name,
                     plaid_official_name,
                     plaid_subtype,
                     plaid_type,
                     plaid_institution_id,
                     created_at,
                     updated_at,
                     access_token_id,
                     deleted_at,
					           account_id,
                     nickname
                  FROM connected_accounts'
            )
            AS plaid_accounts(
			        id TEXT,
              plaid_mask TEXT,
              plaid_name TEXT,
              plaid_official_name TEXT,
              plaid_subtype TEXT,
              plaid_type TEXT,
              plaid_institution_id TEXT,
              created_at TIMESTAMP,
              updated_at TIMESTAMP,
              access_token_id TEXT,
              deleted_at TIMESTAMP,
              account_id TEXT,
              nickname TEXT
            );
  SQL

  plaid_accounts = ActiveRecord::Base.connection.execute(old_plaid_accounts)
  puts "Importing #{plaid_accounts.count} plaid accounts"

  account = Account.first
  user = User.first

  plaid_accounts.each do |plaid_account|
    next if PlaidAccount.find_by(plaid_id: plaid_account["id"]).present?

    PlaidAccount.create!(
      plaid_mask: plaid_account["plaid_mask"],
      plaid_name: plaid_account["plaid_name"],
      plaid_official_name: plaid_account["plaid_official_name"],
      plaid_type: plaid_account["plaid_subtype"],
      plaid_subtype: plaid_account["plaid_subtype"],
      plaid_institution_id: plaid_account["plaid_institution_id"],
      created_at: plaid_account["created_at"],
      updated_at: plaid_account["updated_at"],
      deleted_at: plaid_account["deleted_at"],
      nickname: plaid_account["nickname"],
      account: account,
      plaid_id: plaid_account["id"],
      user: user
    )
  end

  puts "Done importing plaid accounts"
end
