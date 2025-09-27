namespace :test_data do
  desc "Generate comprehensive test data for an account with 3 months of realistic transactions"
  task :generate_account, [:account_id] => :environment do |t, args|
    account_id = args[:account_id]
    
    if account_id.blank?
      puts "Creating new account..."
      account = Account.create!
      account_id = account.id
    else
      account = Account.find(account_id)
    end
    
    puts "Generating test data for account #{account_id}..."
    
    # Create user for the account
    email = "testuser_account_#{account_id}@example.com"
    user = User.find_by(account: account, email: email)
    if user.nil?
      user = User.create!(
        account: account,
        email: email,
        password: "password123",
        password_confirmation: "password123",
        first_name: "Test",
        last_name: "User",
        time_zone: "Eastern Time (US & Canada)"
      )
    end
    
    puts "Created user: #{user.email} (ID: #{user.id})"
    
    # Create merchant tags (categories)
    puts "Creating merchant tags..."
    merchant_tags = create_merchant_tags(account, user)
    
    # Create merchants
    puts "Creating merchants..."
    merchants = create_merchants(account, merchant_tags)
    
    # Create plaid access token first
    puts "Creating plaid access token..."
    plaid_access_token = PlaidAccessToken.create!(
      account: account,
      token: "test_token_#{SecureRandom.hex(8)}"
    )
    
    # Create plaid sync event
    puts "Creating sync event..."
    sync_event = PlaidSyncEvent.create!(
      account: account,
      plaid_access_token: plaid_access_token,
      event_type: "COMPLETED",
      started_at: Time.current,
      completed_at: Time.current,
      cursor: "test_cursor_#{SecureRandom.hex(8)}"
    )
    
    # Create plaid accounts
    puts "Creating plaid accounts..."
    plaid_accounts = create_plaid_accounts(account, user, plaid_access_token)
    
    # Generate transactions for the last 3 months
    puts "Generating transactions for 3 months..."
    generate_transactions(account, merchants, plaid_accounts, sync_event, merchant_tags)
    
    # Create account balances
    puts "Creating account balances..."
    create_account_balances(plaid_accounts)
    
    puts "Test data generation complete!"
    puts "Account ID: #{account_id}"
    puts "User email: #{user.email}"
    puts "Total transactions: #{account.plaid_transactions.count}"
    puts "Total merchants: #{account.merchants.count}"
    puts "Total merchant tags: #{account.merchant_tags.count}"
  end
  
  private
  
  def create_merchant_tags(account, user)
    tags = {}
    
    # Main categories
    main_categories = [
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
    
    main_categories.each do |category|
      tag = MerchantTag.create!(
        account_id: account.id,
        user_id: user.id,
        name: category[:name],
        color: category[:color]
      )
      tags[category[:name]] = tag
    end
    
    # Subcategories
    subcategories = {
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
    
    subcategories.each do |parent_name, children|
      parent_tag = tags[parent_name]
      children.each do |child_name|
        MerchantTag.create!(
          account_id: account.id,
          user_id: user.id,
          name: child_name,
          color: parent_tag.color,
          parent_merchant_tag_id: parent_tag.id
        )
      end
    end
    
    tags
  end
  
  def create_merchants(account, merchant_tags)
    merchants = {}
    
    # Define realistic merchants with their categories and transaction types
    merchant_data = [
      # Food & Dining
      { name: "Whole Foods Market", category: "Groceries", type: "expense", amount_range: [50, 200] },
      { name: "Starbucks", category: "Coffee Shops", type: "expense", amount_range: [5, 15] },
      { name: "McDonald's", category: "Fast Food", type: "expense", amount_range: [8, 25] },
      { name: "Chipotle", category: "Fast Food", type: "expense", amount_range: [10, 20] },
      { name: "Pizza Hut", category: "Delivery", type: "expense", amount_range: [20, 40] },
      { name: "Olive Garden", category: "Restaurants", type: "expense", amount_range: [30, 80] },
      { name: "Trader Joe's", category: "Groceries", type: "expense", amount_range: [40, 120] },
      
      # Transportation
      { name: "Shell", category: "Gas", type: "expense", amount_range: [30, 60] },
      { name: "Exxon", category: "Gas", type: "expense", amount_range: [25, 55] },
      { name: "Uber", category: "Rideshare", type: "expense", amount_range: [8, 35] },
      { name: "Lyft", category: "Rideshare", type: "expense", amount_range: [7, 30] },
      { name: "Metro Transit", category: "Public Transit", type: "expense", amount_range: [2, 8] },
      { name: "Jiffy Lube", category: "Car Maintenance", type: "expense", amount_range: [40, 80] },
      
      # Shopping
      { name: "Amazon", category: "Online Shopping", type: "expense", amount_range: [15, 150] },
      { name: "Target", category: "Department Stores", type: "expense", amount_range: [20, 100] },
      { name: "Walmart", category: "Department Stores", type: "expense", amount_range: [15, 80] },
      { name: "Best Buy", category: "Electronics", type: "expense", amount_range: [50, 500] },
      { name: "Nike", category: "Clothing", type: "expense", amount_range: [30, 120] },
      { name: "Home Depot", category: "Home & Garden", type: "expense", amount_range: [25, 200] },
      
      # Entertainment
      { name: "Netflix", category: "Streaming Services", type: "expense", amount_range: [15, 15] },
      { name: "Spotify", category: "Streaming Services", type: "expense", amount_range: [10, 10] },
      { name: "AMC Theaters", category: "Movies", type: "expense", amount_range: [12, 25] },
      { name: "Steam", category: "Games", type: "expense", amount_range: [10, 60] },
      
      # Bills & Utilities
      { name: "ConEd", category: "Electric", type: "expense", amount_range: [80, 150] },
      { name: "Verizon", category: "Phone", type: "expense", amount_range: [60, 100] },
      { name: "Comcast", category: "Internet", type: "expense", amount_range: [50, 80] },
      { name: "Progressive", category: "Insurance", type: "expense", amount_range: [100, 200] },
      
      # Healthcare
      { name: "CVS Pharmacy", category: "Pharmacy", type: "expense", amount_range: [15, 50] },
      { name: "Walgreens", category: "Pharmacy", type: "expense", amount_range: [12, 45] },
      { name: "City Medical Center", category: "Doctor Visits", type: "expense", amount_range: [100, 300] },
      
      # Personal Care
      { name: "Supercuts", category: "Haircuts", type: "expense", amount_range: [20, 40] },
      { name: "Planet Fitness", category: "Gym", type: "expense", amount_range: [10, 10] },
      { name: "Sephora", category: "Beauty Products", type: "expense", amount_range: [25, 80] },
      
      # Income
      { name: "ACME Corp", category: "Salary", type: "income", amount_range: [3000, 3000] },
      { name: "Freelance Client", category: "Freelance", type: "income", amount_range: [500, 1200] },
      { name: "Bank Interest", category: "Investment Returns", type: "income", amount_range: [5, 25] },
      { name: "Amazon Refund", category: "Refunds", type: "income", amount_range: [20, 100] },
      
      # Savings & Investments
      { name: "Vanguard", category: "Retirement", type: "expense", amount_range: [200, 500] },
      { name: "Emergency Fund Transfer", category: "Emergency Fund", type: "expense", amount_range: [100, 300] },
    ]
    
    merchant_data.each do |data|
      # Find the merchant tag by name (could be main category or subcategory)
      category_tag = MerchantTag.find_by(account: account, name: data[:category])
      
      if category_tag.nil?
        puts "Warning: Category '#{data[:category]}' not found for merchant '#{data[:name]}'"
        # Use a default category if not found
        category_tag = MerchantTag.find_by(account: account, name: "Food & Dining")
      end
      
      merchant = Merchant.create!(
        account: account,
        merchant_name: data[:name],
        default_merchant_tag_id: category_tag.id,
        default_transaction_type: data[:type],
        plaid_entity_id: "entity_#{SecureRandom.hex(8)}"
      )
      
      merchants[data[:name]] = {
        merchant: merchant,
        category: data[:category],
        type: data[:type],
        amount_range: data[:amount_range]
      }
    end
    
    merchants
  end
  
  def create_plaid_accounts(account, user, plaid_access_token)
    accounts = {}
    
    # Checking account
    checking = PlaidAccount.create!(
      account: account,
      plaid_access_token: plaid_access_token,
      plaid_id: "checking_#{SecureRandom.hex(8)}",
      plaid_mask: "0001",
      plaid_name: "Premier Checking",
      plaid_official_name: "Premier Checking Account",
      plaid_type: "depository",
      plaid_subtype: "checking",
      plaid_institution_id: "ins_123456",
      nickname: "Main Checking"
    )
    
    # Associate with user
    PlaidAccountsUser.create!(plaid_account: checking, user: user)
    accounts[:checking] = checking
    
    # Savings account
    savings = PlaidAccount.create!(
      account: account,
      plaid_access_token: plaid_access_token,
      plaid_id: "savings_#{SecureRandom.hex(8)}",
      plaid_mask: "0002",
      plaid_name: "High Yield Savings",
      plaid_official_name: "High Yield Savings Account",
      plaid_type: "depository",
      plaid_subtype: "savings",
      plaid_institution_id: "ins_123456",
      nickname: "Emergency Fund"
    )
    
    PlaidAccountsUser.create!(plaid_account: savings, user: user)
    accounts[:savings] = savings
    
    # Credit card
    credit = PlaidAccount.create!(
      account: account,
      plaid_access_token: plaid_access_token,
      plaid_id: "credit_#{SecureRandom.hex(8)}",
      plaid_mask: "1234",
      plaid_name: "Rewards Credit Card",
      plaid_official_name: "Rewards Credit Card",
      plaid_type: "credit",
      plaid_subtype: "credit_card",
      plaid_institution_id: "ins_123456",
      nickname: "Main Credit Card"
    )
    
    PlaidAccountsUser.create!(plaid_account: credit, user: user)
    accounts[:credit] = credit
    
    accounts
  end
  
  def generate_transactions(account, merchants, plaid_accounts, sync_event, merchant_tags)
    start_date = 3.months.ago.beginning_of_month
    end_date = Time.current
    
    # Define transaction patterns
    transaction_patterns = {
      # Recurring income (bi-weekly salary)
      "ACME Corp" => { frequency: :biweekly, start_day: 5, account: :checking },
      
      # Recurring expenses
      "Netflix" => { frequency: :monthly, start_day: 15, account: :credit },
      "Spotify" => { frequency: :monthly, start_day: 3, account: :credit },
      "Planet Fitness" => { frequency: :monthly, start_day: 1, account: :checking },
      "ConEd" => { frequency: :monthly, start_day: 20, account: :checking },
      "Verizon" => { frequency: :monthly, start_day: 10, account: :credit },
      "Comcast" => { frequency: :monthly, start_day: 25, account: :checking },
      "Progressive" => { frequency: :monthly, start_day: 5, account: :checking },
      "Vanguard" => { frequency: :monthly, start_day: 1, account: :checking },
      
      # Regular but not strictly recurring
      "Whole Foods Market" => { frequency: :weekly, start_day: nil, account: :credit },
      "Trader Joe's" => { frequency: :weekly, start_day: nil, account: :credit },
      "Shell" => { frequency: :weekly, start_day: nil, account: :credit },
      "Exxon" => { frequency: :weekly, start_day: nil, account: :credit },
    }
    
    current_date = start_date
    
    while current_date <= end_date
      # Generate transactions for this day
      generate_daily_transactions(account, merchants, plaid_accounts, sync_event, current_date, transaction_patterns)
      
      current_date += 1.day
    end
    
    # Add some random transactions throughout the period
    add_random_transactions(account, merchants, plaid_accounts, sync_event, start_date, end_date)
  end
  
  def generate_daily_transactions(account, merchants, plaid_accounts, sync_event, date, patterns)
    patterns.each do |merchant_name, pattern|
      next unless merchants[merchant_name]
      
      merchant_data = merchants[merchant_name]
      should_transact = false
      
      case pattern[:frequency]
      when :daily
        should_transact = true
      when :weekly
        should_transact = date.wday == 1 # Monday
      when :biweekly
        if pattern[:start_day]
          should_transact = date.day == pattern[:start_day] && (date.strftime('%U').to_i % 2 == 0)
        else
          should_transact = date.wday == 5 && (date.strftime('%U').to_i % 2 == 0) # Every other Friday
        end
      when :monthly
        should_transact = date.day == pattern[:start_day]
      end
      
      if should_transact
        amount = generate_amount(merchant_data[:amount_range], merchant_data[:type])
        account_type = pattern[:account]
        
        create_transaction(
          account: account,
          merchant: merchant_data[:merchant],
          plaid_account: plaid_accounts[account_type],
          sync_event: sync_event,
          amount: amount,
          date: date,
          transaction_type: merchant_data[:type]
        )
      end
    end
  end
  
  def add_random_transactions(account, merchants, plaid_accounts, sync_event, start_date, end_date)
    # Random merchants that don't follow strict patterns
    random_merchants = [
      "Starbucks", "McDonald's", "Chipotle", "Pizza Hut", "Olive Garden",
      "Uber", "Lyft", "Metro Transit", "Amazon", "Target", "Walmart",
      "Best Buy", "Nike", "Home Depot", "AMC Theaters", "Steam",
      "CVS Pharmacy", "Walgreens", "City Medical Center", "Supercuts",
      "Sephora", "Freelance Client", "Bank Interest", "Amazon Refund",
      "Emergency Fund Transfer"
    ]
    
    # Generate 2-5 random transactions per week
    current_date = start_date
    while current_date <= end_date
      if current_date.wday == 0 # Sunday - plan the week
        transactions_this_week = rand(2..5)
        
        transactions_this_week.times do
          merchant_name = random_merchants.sample
          next unless merchants[merchant_name]
          
          merchant_data = merchants[merchant_name]
          
          # Random day in the next 7 days
          transaction_date = current_date + rand(0..6).days
          
          # Skip if it's in the future
          next if transaction_date > end_date
          
          amount = generate_amount(merchant_data[:amount_range], merchant_data[:type])
          
          # Choose account based on transaction type and amount
          account_type = choose_account_type(merchant_data[:type], amount)
          
          create_transaction(
            account: account,
            merchant: merchant_data[:merchant],
            plaid_account: plaid_accounts[account_type],
            sync_event: sync_event,
            amount: amount,
            date: transaction_date,
            transaction_type: merchant_data[:type]
          )
        end
      end
      
      current_date += 1.day
    end
  end
  
  def choose_account_type(transaction_type, amount)
    case transaction_type
    when "income"
      :checking
    when "expense"
      if amount > 100
        :credit # Large expenses on credit card
      else
        [:checking, :credit].sample # Mix of checking and credit for smaller expenses
      end
    else
      :checking
    end
  end
  
  def generate_amount(range, transaction_type)
    base_amount = rand(range[0]..range[1])
    
    # For income, make it negative (Plaid convention)
    if transaction_type == "income"
      -base_amount
    else
      base_amount
    end
  end
  
  def create_transaction(account:, merchant:, plaid_account:, sync_event:, amount:, date:, transaction_type:)
    PlaidTransaction.create!(
      account: account,
      plaid_sync_event: sync_event,
      plaid_account: plaid_account,
      merchant: merchant,
      plaid_id: "txn_#{SecureRandom.hex(12)}",
      amount: amount,
      name: merchant.merchant_name,
      authorized_at: date.to_time + rand(0..23).hours + rand(0..59).minutes,
      date: date,
      check_number: nil,
      currency_code: "USD",
      pending: false,
      plaid_category_primary: infer_plaid_category(merchant.default_merchant_tag.name),
      plaid_category_detail: infer_plaid_category_detail(merchant.default_merchant_tag.name),
      payment_channel: ["online", "in_store", "other"].sample,
      transaction_type: transaction_type,
      note: nil,
      recurring: merchant.merchant_name.in?(["ACME Corp", "Netflix", "Spotify", "Planet Fitness", "ConEd", "Verizon", "Comcast", "Progressive", "Vanguard"])
    )
  end
  
  def infer_plaid_category(tag_name)
    category_mapping = {
      "Groceries" => "FOOD_AND_DRINK",
      "Restaurants" => "FOOD_AND_DRINK",
      "Coffee Shops" => "FOOD_AND_DRINK",
      "Fast Food" => "FOOD_AND_DRINK",
      "Delivery" => "FOOD_AND_DRINK",
      "Gas" => "TRANSPORTATION",
      "Public Transit" => "TRANSPORTATION",
      "Rideshare" => "TRANSPORTATION",
      "Car Maintenance" => "TRANSPORTATION",
      "Clothing" => "GENERAL_MERCHANDISE",
      "Electronics" => "GENERAL_MERCHANDISE",
      "Online Shopping" => "GENERAL_MERCHANDISE",
      "Department Stores" => "GENERAL_MERCHANDISE",
      "Movies" => "ENTERTAINMENT",
      "Streaming Services" => "ENTERTAINMENT",
      "Games" => "ENTERTAINMENT",
      "Electric" => "UTILITIES",
      "Phone" => "UTILITIES",
      "Internet" => "UTILITIES",
      "Insurance" => "INSURANCE",
      "Pharmacy" => "MEDICAL",
      "Doctor Visits" => "MEDICAL",
      "Haircuts" => "PERSONAL_CARE",
      "Gym" => "PERSONAL_CARE",
      "Beauty Products" => "PERSONAL_CARE",
      "Salary" => "INCOME",
      "Freelance" => "INCOME",
      "Investment Returns" => "INCOME",
      "Refunds" => "INCOME",
      "Retirement" => "INVESTMENT",
      "Emergency Fund" => "TRANSFER"
    }
    
    category_mapping[tag_name] || "GENERAL_MERCHANDISE"
  end
  
  def infer_plaid_category_detail(tag_name)
    detail_mapping = {
      "Groceries" => "GROCERIES",
      "Restaurants" => "RESTAURANTS",
      "Coffee Shops" => "COFFEE_SHOPS",
      "Fast Food" => "FAST_FOOD_RESTAURANTS",
      "Delivery" => "FOOD_DELIVERY",
      "Gas" => "GAS_STATIONS",
      "Public Transit" => "PUBLIC_TRANSPORTATION",
      "Rideshare" => "TAXI",
      "Car Maintenance" => "AUTO_MAINTENANCE",
      "Clothing" => "CLOTHING_AND_ACCESSORIES",
      "Electronics" => "ELECTRONICS",
      "Online Shopping" => "ONLINE_RETAILERS",
      "Department Stores" => "DEPARTMENT_STORES",
      "Movies" => "MOVIES_AND_THEATERS",
      "Streaming Services" => "STREAMING_SERVICES",
      "Games" => "VIDEO_GAMES",
      "Electric" => "ELECTRICITY",
      "Phone" => "TELECOM",
      "Internet" => "INTERNET",
      "Insurance" => "AUTO_INSURANCE",
      "Pharmacy" => "PHARMACIES",
      "Doctor Visits" => "PRIMARY_CARE",
      "Haircuts" => "HAIR_AND_BEAUTY",
      "Gym" => "GYMS_AND_FITNESS_CENTERS",
      "Beauty Products" => "COSMETICS",
      "Salary" => "PAYROLL",
      "Freelance" => "FREELANCE",
      "Investment Returns" => "INVESTMENT_INCOME",
      "Refunds" => "REFUNDS",
      "Retirement" => "RETIREMENT_ACCOUNTS",
      "Emergency Fund" => "SAVINGS"
    }
    
    detail_mapping[tag_name] || "GENERAL_MERCHANDISE"
  end
  
  def create_account_balances(plaid_accounts)
    plaid_accounts.each do |type, account|
      # Calculate current balance based on transactions
      transactions = account.plaid_transactions.not_pending
      balance = transactions.sum(:amount)
      
      # Ensure positive balance for checking/savings, negative for credit
      if type == :credit
        balance = [balance, -1000].min # Credit card debt
      else
        balance = [balance, 1000].max # Minimum positive balance
      end
      
      AccountBalance.create!(
        plaid_account: account,
        current_balance: balance,
        available_balance: type == :credit ? balance + 5000 : balance, # Credit limit
        limit: type == :credit ? 5000 : nil
      )
    end
  end
end
