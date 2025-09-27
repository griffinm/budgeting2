# Test Data Generator for Budgeting App

This tool generates comprehensive, realistic test data for the budgeting application, simulating 3 months of financial activity for a typical person.

## What It Creates

### 🏦 Account Structure
- **User Account**: Complete user profile with realistic details
- **Multiple Account Types**:
  - Checking account (main spending account)
  - Savings account (emergency fund)
  - Credit card (for larger purchases)

### 🏷️ Merchant Tags & Categories
- **Hierarchical Categories**: 10 main categories with subcategories
- **Color-coded Tags**: Each category has a distinct color for easy identification
- **Categories Include**:
  - Food & Dining (Restaurants, Groceries, Coffee, Fast Food, Delivery)
  - Transportation (Gas, Public Transit, Rideshare, Car Maintenance)
  - Shopping (Clothing, Electronics, Online Shopping, Department Stores)
  - Entertainment (Movies, Streaming, Sports, Games)
  - Bills & Utilities (Electric, Phone, Internet, Insurance)
  - Healthcare (Doctor Visits, Pharmacy, Dental, Emergency)
  - Income (Salary, Freelance, Investment Returns, Refunds)
  - Savings & Investments (Emergency Fund, Retirement, Stocks)
  - Personal Care (Haircuts, Gym, Beauty Products)
  - Education (Tuition, Books, Online Courses)

### 🏪 Realistic Merchants
- **40+ Realistic Merchants** with proper categorization
- **Transaction Patterns**: Recurring vs. random transactions
- **Realistic Amounts**: Based on actual spending patterns
- **Examples**:
  - Whole Foods, Trader Joe's (groceries)
  - Starbucks, McDonald's, Chipotle (food)
  - Amazon, Target, Walmart (shopping)
  - Shell, Exxon (gas)
  - Netflix, Spotify (subscriptions)
  - ConEd, Verizon (utilities)

### 💰 Transaction History
- **3 Months of Data**: Realistic transaction patterns
- **Recurring Transactions**: Salary (bi-weekly), bills (monthly), subscriptions
- **Random Transactions**: Shopping, dining, entertainment
- **Proper Timing**: Transactions occur on realistic days/times
- **Transaction Types**: Income, expenses, transfers properly categorized

### 📊 Account Balances
- **Realistic Balances**: Calculated from actual transaction history
- **Credit Limits**: Proper credit card limits and available balance
- **Minimum Balances**: Ensures realistic account states

## Usage

### Option 1: Simple Script (Recommended)
```bash
./generate_test_data.sh
```

### Option 2: Direct Rails Command
```bash
rails test_data:generate_account
```

### Option 3: For Existing Account
```bash
rails test_data:generate_account[ACCOUNT_ID]
```

## Login Credentials

After generation, you can login with:
- **Email**: `testuser_account_[ACCOUNT_ID]@example.com` (e.g., `testuser_account_10@example.com`)
- **Password**: `password123`

## Transaction Patterns

The generator creates realistic spending patterns:

### Recurring Income
- **Salary**: $3,000 bi-weekly from "ACME Corp"
- **Freelance**: $500-1,200 monthly from various clients
- **Investment Returns**: $5-25 monthly from "Bank Interest"

### Recurring Expenses
- **Subscriptions**: Netflix ($15), Spotify ($10), Planet Fitness ($10)
- **Utilities**: ConEd ($80-150), Verizon ($60-100), Comcast ($50-80)
- **Insurance**: Progressive ($100-200)
- **Savings**: Vanguard retirement ($200-500)

### Variable Expenses
- **Groceries**: Whole Foods ($50-200), Trader Joe's ($40-120)
- **Dining**: Starbucks ($5-15), McDonald's ($8-25), restaurants ($30-80)
- **Transportation**: Gas ($25-60), Uber/Lyft ($7-35)
- **Shopping**: Amazon ($15-150), Target ($20-100), Best Buy ($50-500)

## Data Quality Features

- **Realistic Timing**: Transactions occur at appropriate times
- **Proper Categorization**: All transactions properly tagged
- **Account Logic**: Large expenses on credit, small on checking
- **Balance Consistency**: Account balances reflect transaction history
- **Plaid Compatibility**: Uses proper Plaid transaction structure

## Customization

You can modify the generator by editing `/lib/tasks/generate_test_data.rake`:

- **Add Merchants**: Modify the `merchant_data` array
- **Change Patterns**: Adjust `transaction_patterns` for different frequencies
- **Modify Amounts**: Update `amount_range` for different spending levels
- **Add Categories**: Extend `merchant_tags` and `subcategories`

## Troubleshooting

### Common Issues
1. **Rails not found**: Ensure Rails is installed and in PATH
2. **Database errors**: Make sure database is set up and migrated
3. **Permission errors**: Ensure script has execute permissions (`chmod +x`)

### Verification
After generation, verify the data by:
1. Logging into the application
2. Checking the dashboard for transaction summaries
3. Viewing the transactions page for detailed history
4. Examining merchant and category organization

## File Structure

```
lib/tasks/generate_test_data.rake  # Main generator logic
generate_test_data.sh              # Convenience script
README.md                          # This documentation
```

The generator creates a complete, realistic financial dataset that allows you to test all features of the budgeting application with meaningful data.
