class RemoveUserIdFromPlaidAccount < ActiveRecord::Migration[8.0]
  def change
    remove_column :plaid_accounts, :user_id
  end
end
