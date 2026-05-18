class AddConnectionStatusToPlaidAccessTokens < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_access_tokens, :status, :string, null: false, default: "active"
    add_column :plaid_access_tokens, :error_code, :string
    add_column :plaid_access_tokens, :last_synced_at, :datetime
    add_column :plaid_access_tokens, :last_error_at, :datetime
  end
end
