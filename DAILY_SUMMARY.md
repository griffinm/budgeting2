# Daily Summary Email Feature

This feature sends automated daily summary emails to all users with their transaction data from the previous day.

## Overview

The daily summary email includes:
- Summary statistics (total transactions, expenses, income)
- List of yesterday's transactions with merchant names and categories
- Top spending categories
- Account balances (if available)

## Components

### Mailer
- **File**: `app/mailers/daily_summary_mailer.rb`
- **Method**: `daily_summary_email(user)`
- **Templates**: 
  - `app/views/daily_summary_mailer/daily_summary_email.html.erb` (HTML version)
  - `app/views/daily_summary_mailer/daily_summary_email.text.erb` (Plain text version)

### Background Job
- **File**: `app/sidekiq/daily_summary_job.rb`
- **Class**: `DailySummaryJob`
- **Schedule**: Runs daily at 6:00 AM (configured in `config/recurring.yml`)

### Rake Tasks
- `rake daily_summary:send` - Send daily summary to all users
- `rake daily_summary:send_to_user EMAIL=user@example.com` - Send to specific user

## Configuration

### Email Settings
The default from address is set to noreply@scriptmasterg.com. Update this in `config/initiailizers/constants.rb`

### AWS SES Configuration
The application is configured to use Amazon SES for email delivery. Configure the following environment variables:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1  # or your preferred region
APP_HOST=budgeting2.com  # your domain
```

#### SES Setup Steps:
1. **Verify your domain** in the AWS SES console
2. **Request production access** if you're in the SES sandbox
3. **Set up DKIM** for better deliverability
4. **Configure environment variables** with your AWS credentials

#### Testing SES Configuration:
```bash
# Test SES connection and send test email
rake ses:test EMAIL=your-email@example.com

# Check domain verification status
rake ses:verify_domain DOMAIN=budgeting2.com

# Check sending limits
rake ses:limits
```

### Scheduling
The job is scheduled to run daily at 6:00 AM using Sidekiq's recurring jobs feature. The schedule is defined in `config/recurring.yml`.

## Testing

### Manual Testing
1. Send to all users:
   ```bash
   rake daily_summary:send
   ```

2. Send to specific user:
   ```bash
   rake daily_summary:send_to_user EMAIL=user@example.com
   ```

### Automated Testing
Run the test suite:
```bash
rspec spec/mailers/daily_summary_mailer_spec.rb
rspec spec/sidekiq/daily_summary_job_spec.rb
```

## Email Content

The daily summary email includes:

1. **Header**: Date and greeting
2. **Summary Statistics**: 
   - Total number of transactions
   - Total expenses
   - Total income
3. **Transaction List**: All transactions from yesterday with:
   - Merchant name
   - Category
   - Account name
   - Amount (color-coded for expenses/income)
4. **Top Spending Categories**: Top 5 categories by spending amount
5. **Account Balances**: Current balances for all accounts
6. **Footer**: Generation timestamp

## Error Handling

The background job includes error handling:
- Individual email failures don't stop the job for other users
- Errors are logged with user email and error message
- Success messages are logged for each successful email

## Customization

### Adding New Data
To include additional data in the summary, modify the `daily_summary_email` method in `DailySummaryMailer` and update the corresponding view templates.

### Changing Schedule
Update the schedule in `config/recurring.yml`:
```yaml
production:
  daily_summary:
    class: DailySummaryJob
    queue: default
    schedule: at 6am every day  # Change this line
```

### Email Template Styling
The HTML template uses inline CSS for maximum email client compatibility. Modify the styles in `app/views/daily_summary_mailer/daily_summary_email.html.erb` to customize the appearance.

## Monitoring

Check the application logs for:
- Success messages: "Daily summary email sent to user@example.com"
- Error messages: "Failed to send daily summary email to user@example.com: error message"

The job runs in the Sidekiq queue, so you can monitor it through the Sidekiq web interface if configured. 