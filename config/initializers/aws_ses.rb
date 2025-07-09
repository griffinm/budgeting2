# AWS SES Configuration for Action Mailer
require 'aws-sdk-ses'

# Load custom SES delivery method
require_relative '../../lib/action_mailer/ses_delivery_method'

# Configure AWS SES client
Aws.config.update({
  region: ENV.fetch('AWS_REGION', 'us-east-1'),
  credentials: Aws::Credentials.new(
    ENV.fetch('AWS_ACCESS_KEY_ID'),
    ENV.fetch('AWS_SECRET_ACCESS_KEY')
  )
})

# Create SES client instance
SES_CLIENT = Aws::SES::Client.new

# Configure Action Mailer to use SES
Rails.application.config.action_mailer.delivery_method = :ses
Rails.application.config.action_mailer.ses_settings = {
  client: SES_CLIENT,
  region: ENV.fetch('AWS_REGION', 'us-east-1')
} 