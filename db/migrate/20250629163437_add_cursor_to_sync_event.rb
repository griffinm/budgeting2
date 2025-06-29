class AddCursorToSyncEvent < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_sync_events, :cursor, :string
  end
end
