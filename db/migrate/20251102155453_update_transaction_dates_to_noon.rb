class UpdateTransactionDatesToNoon < ActiveRecord::Migration[8.0]
  def up
    # Update transaction dates from midnight to noon
    # This helps avoid date boundary issues with timezone conversions
    
    # Update the date field where time is 00:00:00
    execute <<-SQL
      UPDATE plaid_transactions
      SET date = date + INTERVAL '12 hours'
      WHERE EXTRACT(HOUR FROM date) = 0 
        AND EXTRACT(MINUTE FROM date) = 0 
        AND EXTRACT(SECOND FROM date) = 0
    SQL
    
    # Update the date field where time is 00:00:00
    execute <<-SQL
      UPDATE plaid_transactions
      SET date = date + INTERVAL '12 hours'
      WHERE date IS NOT NULL
        AND EXTRACT(HOUR FROM date) = 0 
        AND EXTRACT(MINUTE FROM date) = 0 
        AND EXTRACT(SECOND FROM date) = 0
    SQL
  end

  def down
    # Revert noon times back to midnight
    execute <<-SQL
      UPDATE plaid_transactions
      SET date = date - INTERVAL '12 hours'
      WHERE EXTRACT(HOUR FROM date) = 12 
        AND EXTRACT(MINUTE FROM date) = 0 
        AND EXTRACT(SECOND FROM date) = 0
    SQL
    
    execute <<-SQL
      UPDATE plaid_transactions
      SET date = date - INTERVAL '12 hours'
      WHERE date IS NOT NULL
        AND EXTRACT(HOUR FROM date) = 12 
        AND EXTRACT(MINUTE FROM date) = 0 
        AND EXTRACT(SECOND FROM date) = 0
    SQL
  end
end
