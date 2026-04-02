class AddReportFrequencyToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :report_frequency, :string, default: "daily", null: false
    add_column :users, :report_day_of_week, :integer
  end
end
