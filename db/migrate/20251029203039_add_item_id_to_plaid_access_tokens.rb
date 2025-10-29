class AddItemIdToPlaidAccessTokens < ActiveRecord::Migration[8.0]
  def change
    add_column :plaid_access_tokens, :item_id, :string
  end
end
