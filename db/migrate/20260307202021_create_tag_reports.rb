class CreateTagReports < ActiveRecord::Migration[8.0]
  def change
    create_table :tag_reports do |t|
      t.string :name, null: false
      t.text :description
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.datetime :deleted_at
      t.timestamps
    end

    create_table :tag_report_tags do |t|
      t.references :tag_report, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true
      t.string :role, null: false
      t.timestamps
    end

    add_index :tag_report_tags, [:tag_report_id, :tag_id], unique: true
  end
end
