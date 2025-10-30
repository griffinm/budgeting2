class AddIsDemoToAccount < ActiveRecord::Migration[8.0]
  def up
    add_column :accounts, :is_demo, :boolean, default: false
    
    demo_users = User.where('email LIKE ?', '%@example.com')
    demo_users.each do |user|
      user.account.update(is_demo: true)
    end
  end

  def down
    remove_column :accounts, :is_demo
  end
end
