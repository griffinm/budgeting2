# AWS SES Setup Guide

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Application Configuration
APP_HOST=budgeting2.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/budgeting2_production

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Other Configuration
RAILS_LOG_LEVEL=info
```

## AWS SES Setup Steps

### 1. Create AWS SES Account
1. Go to AWS SES Console
2. Select your preferred region
3. Note: New accounts start in sandbox mode

### 2. Verify Your Domain
1. In SES Console, go to "Verified identities"
2. Click "Create identity"
3. Choose "Domain" and enter your domain (e.g., `budgeting2.com`)
4. Follow the DNS verification steps
5. Wait for verification (usually takes a few minutes)

### 3. Request Production Access (if in sandbox)
1. In SES Console, go to "Account dashboard"
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (can take 24-48 hours)

### 4. Set Up DKIM (Recommended)
1. In SES Console, select your verified domain
2. Go to "Authentication" tab
3. Enable DKIM
4. Add the provided DNS records to your domain

### 5. Configure Environment Variables
Set the environment variables in your deployment environment or `.env` file.

## Testing

### Test SES Configuration
```bash
# Test connection and send test email
rake ses:test EMAIL=your-email@example.com

# Check domain verification
rake ses:verify_domain DOMAIN=budgeting2.com

# Check sending limits
rake ses:limits
```

### Test Daily Summary
```bash
# Send daily summary to all users
rake daily_summary:send

# Send to specific user
rake daily_summary:send_to_user EMAIL=user@example.com
```

## Troubleshooting

### Common Issues

1. **"Email address not verified"**
   - Verify your sender email address in SES console
   - Or verify your entire domain

2. **"Sending quota exceeded"**
   - Check your SES sending limits
   - Request production access if in sandbox

3. **"Invalid credentials"**
   - Verify your AWS access keys
   - Ensure the IAM user has SES permissions

4. **"Domain not verified"**
   - Complete domain verification in SES console
   - Wait for DNS propagation

### IAM Permissions

Your AWS user needs the following SES permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics",
        "ses:ListIdentities",
        "ses:GetIdentityVerificationAttributes"
      ],
      "Resource": "*"
    }
  ]
}
```

## Monitoring

### SES Metrics to Monitor
- Bounce rate
- Complaint rate
- Delivery rate
- Sending quota usage

### Logs
Check Rails logs for SES delivery messages:
- Success: "SES email sent successfully: message-id"
- Error: "SES email delivery failed: error-message" 