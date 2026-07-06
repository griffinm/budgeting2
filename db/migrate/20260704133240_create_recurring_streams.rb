class CreateRecurringStreams < ActiveRecord::Migration[8.0]
  def change
    create_table :recurring_streams do |t|
      t.references :account, null: false, foreign_key: true, index: true
      t.references :merchant, null: false, foreign_key: true, index: true
      t.string :source, null: false, default: "heuristic"
      t.string :status, null: false, default: "suggested"
      t.string :frequency, null: false
      t.string :amount_signature, null: false
      t.float :average_amount
      t.float :last_amount
      t.date :first_date
      t.date :last_date
      t.date :predicted_next_date
      t.integer :occurrence_count, null: false, default: 0
      t.float :confidence
      t.boolean :active, null: false, default: true
      t.string :plaid_stream_id
      t.timestamps
    end

    add_index :recurring_streams, [:account_id, :merchant_id, :frequency, :amount_signature],
      unique: true, name: "idx_recurring_streams_identity"
    add_index :recurring_streams, [:account_id, :status]
  end
end
