require 'aws-sdk-ses'

module ActionMailer
  class SESDeliveryMethod
    attr_accessor :settings

    def initialize(settings)
      @settings = settings
    end

    def deliver!(mail)
      # Configure AWS client if not already configured
      unless Aws.config[:region]
        Aws.config.update({
          region: settings[:region] || ENV.fetch('AWS_REGION', 'us-east-1'),
          credentials: Aws::Credentials.new(
            ENV.fetch('AWS_ACCESS_KEY_ID'),
            ENV.fetch('AWS_SECRET_ACCESS_KEY')
          )
        })
      end

      # Create SES client
      ses_client = settings[:client] || Aws::SES::Client.new

      # Prepare email parameters
      params = {
        source: mail.from.first,
        destination: {
          to_addresses: mail.to,
          cc_addresses: mail.cc || [],
          bcc_addresses: mail.bcc || []
        },
        message: {
          subject: {
            data: mail.subject,
            charset: 'UTF-8'
          },
          body: {
            text: {
              data: mail.text_part&.body&.to_s || mail.body.to_s,
              charset: 'UTF-8'
            },
            html: {
              data: mail.html_part&.body&.to_s || mail.body.to_s,
              charset: 'UTF-8'
            }
          }
        }
      }

      # Add reply-to if present
      if mail.reply_to&.any?
        params[:reply_to_addresses] = mail.reply_to
      end

      # Send email via SES
      begin
        response = ses_client.send_email(params)
        Rails.logger.info "SES email sent successfully: #{response.message_id}"
        response
      rescue Aws::SES::Errors::ServiceError => e
        Rails.logger.error "SES email delivery failed: #{e.message}"
        raise e
      end
    end
  end
end

# Register the delivery method
ActionMailer::Base.add_delivery_method :ses, ActionMailer::SESDeliveryMethod 