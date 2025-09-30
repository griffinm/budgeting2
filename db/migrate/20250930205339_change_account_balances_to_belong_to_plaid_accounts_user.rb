class ChangeAccountBalancesToBelongToPlaidAccountsUser < ActiveRecord::Migration[8.0]
  def up
    # Add the new column first (nullable)
    add_reference :account_balances, :plaid_accounts_user, null: true, foreign_key: true
    
    # Populate the new column with data
    execute <<-SQL
      UPDATE account_balances 
      SET plaid_accounts_user_id = (
        SELECT plaid_accounts_users.id 
        FROM plaid_accounts_users 
        WHERE plaid_accounts_users.plaid_account_id = account_balances.plaid_account_id
        LIMIT 1
      )
    SQL
    
    # Make the column non-nullable
    change_column_null :account_balances, :plaid_accounts_user_id, false
    
    # Remove the old foreign key and index
    remove_foreign_key :account_balances, :plaid_accounts
    remove_index :account_balances, :plaid_account_id
    
    # Remove the old column
    remove_column :account_balances, :plaid_account_id, :bigint
  end
  
  def down
    # Add back the old column
    add_reference :account_balances, :plaid_account, null: true, foreign_key: true
    
    # Populate the old column with data
    execute <<-SQL
      UPDATE account_balances 
      SET plaid_account_id = (
        SELECT plaid_accounts_users.plaid_account_id 
        FROM plaid_accounts_users 
        WHERE plaid_accounts_users.id = account_balances.plaid_accounts_user_id
      )
    SQL
    
    # Make the column non-nullable
    change_column_null :account_balances, :plaid_account_id, false
    
    # Remove the new foreign key and index
    remove_foreign_key :account_balances, :plaid_accounts_users
    remove_index :account_balances, :plaid_accounts_user_id
    
    # Remove the new column
    remove_column :account_balances, :plaid_accounts_user_id, :bigint
  end
end
