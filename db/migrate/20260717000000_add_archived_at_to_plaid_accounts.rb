class AddArchivedAtToPlaidAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_accounts, :archived_at, :datetime, null: true
  end
end
