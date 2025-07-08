class CreatePlaidAccountsUser < ActiveRecord::Migration[8.0]
  def up
    create_table :plaid_accounts_users do |t|
      t.references :plaid_account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    # Add existing accounts
    PlaidAccount.all.each do |plaid_account|
      account_users = plaid_account.account.users
      account_users.each do |user|
        PlaidAccountsUser.create!(plaid_account: plaid_account, user: user)
      end
    end
  end

  def down
    drop_table :plaid_accounts_users
  end
end
