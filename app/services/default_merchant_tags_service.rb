# Service to create default merchant tags for a new account
class DefaultMerchantTagsService
  def self.create_for_account(account, user)
    return if account.merchant_tags.exists?
    
    new(account, user).create_default_tags
  end
  
  def initialize(account, user)
    @account = account
    @user = user
  end
  
  def create_default_tags
    tags = {}
    
    # Create main categories
    main_categories.each do |category|
      tag = MerchantTag.create!(
        account_id: @account.id,
        user_id: @user.id,
        name: category[:name],
        color: category[:color]
      )
      tags[category[:name]] = tag
    end
    
    # Create subcategories
    subcategories.each do |parent_name, children|
      parent_tag = tags[parent_name]
      next unless parent_tag
      
      children.each do |child_name|
        MerchantTag.create!(
          account_id: @account.id,
          user_id: @user.id,
          name: child_name,
          color: parent_tag.color,
          parent_merchant_tag_id: parent_tag.id
        )
      end
    end
    
    tags
  end
  
  private
  
  def main_categories
    [
      { name: "Food & Dining", color: "#FF6B6B" },
      { name: "Transportation", color: "#4ECDC4" },
      { name: "Shopping", color: "#45B7D1" },
      { name: "Entertainment", color: "#96CEB4" },
      { name: "Bills & Utilities", color: "#FFEAA7" },
      { name: "Healthcare", color: "#DDA0DD" },
      { name: "Income", color: "#98D8C8" },
      { name: "Savings & Investments", color: "#F7DC6F" },
      { name: "Personal Care", color: "#BB8FCE" },
      { name: "Education", color: "#85C1E9" }
    ]
  end
  
  def subcategories
    {
      "Food & Dining" => ["Restaurants", "Groceries", "Coffee Shops", "Fast Food", "Delivery"],
      "Transportation" => ["Gas", "Public Transit", "Rideshare", "Parking", "Car Maintenance"],
      "Shopping" => ["Clothing", "Electronics", "Home & Garden", "Online Shopping", "Department Stores"],
      "Entertainment" => ["Movies", "Streaming Services", "Sports", "Concerts", "Games"],
      "Bills & Utilities" => ["Electric", "Water", "Internet", "Phone", "Insurance"],
      "Healthcare" => ["Doctor Visits", "Pharmacy", "Dental", "Vision", "Emergency"],
      "Income" => ["Salary", "Freelance", "Investment Returns", "Refunds", "Cashback"],
      "Savings & Investments" => ["Emergency Fund", "Retirement", "Stocks", "Bonds", "Savings Account"],
      "Personal Care" => ["Haircuts", "Skincare", "Gym", "Massage", "Beauty Products"],
      "Education" => ["Tuition", "Books", "Online Courses", "Certifications", "Supplies"]
    }
  end
end

