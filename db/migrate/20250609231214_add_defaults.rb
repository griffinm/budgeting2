class AddDefaults < ActiveRecord::Migration[8.0]
  def up
    add_column :merchants, :default_transaction_type, :string

    Merchant.update_all(default_transaction_type: 'expense')

    PlaidTransaction.where(transaction_type: nil).update_all(transaction_type: 'expense')
  end

  def down
    remove_column :merchants, :default_transaction_type
  end
end
