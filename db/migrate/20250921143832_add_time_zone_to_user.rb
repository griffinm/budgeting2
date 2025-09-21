class AddTimeZoneToUser < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :time_zone, :string
  
    Account.all.each do |account|
      
      # Set the time zone for the account
      account.users.each do |user|
        user.update(time_zone: 'Eastern Time (US & Canada)')
      end

      # Set the time zone for all of the transactions
      account.plaid_transactions.each do |transaction|
        new_date = transaction.date.in_time_zone('Eastern Time (US & Canada)').to_date
        new_date = new_date + 12.hours
        transaction.update(date: new_date)
      end
    end

  end

  def down
    remove_column :users, :time_zone
  end
end
