class AddTargetBudgetToMerchantTag < ActiveRecord::Migration[8.0]
  def change
    add_column :merchant_tags, :target_budget, :decimal, precision: 10, scale: 2
  end
end
