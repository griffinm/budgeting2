class AddMerchantTagToPlaidTransaction < ActiveRecord::Migration[8.0]
  def change
    add_reference :plaid_transactions, :merchant_tag, foreign_key: true
  end
end
