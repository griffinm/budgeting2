class AddRecurringStreamToPlaidTransactions < ActiveRecord::Migration[8.0]
  def change
    add_reference :plaid_transactions, :recurring_stream,
      foreign_key: { on_delete: :nullify }, index: true, null: true
  end
end
