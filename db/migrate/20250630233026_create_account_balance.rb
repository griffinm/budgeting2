class CreateAccountBalance < ActiveRecord::Migration[8.0]
  def change
    create_table :account_balances do |t|
      t.references :plaid_account, null: false, foreign_key: true
      t.decimal :current_balance, null: false
      t.decimal :available_balance, null: false
      t.decimal :limit, null: true

      t.timestamps
    end
  end
end
