class AddPlaidAccountIdToPlaidAccessToken < ActiveRecord::Migration[8.0]
  def change
    add_reference :plaid_accounts, :plaid_access_token, foreign_key: true
  end
end
