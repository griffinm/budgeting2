require "rails_helper"

RSpec.describe ActionMailer::SESDeliveryMethod, type: :mailer do
  let(:delivery_method) { ActionMailer::SESDeliveryMethod.new({}) }
  let(:mail) do
    ActionMailer::Base.mail(
      from: Constants::Email::FROM_ADDRESS,
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email'
    )
  end

  describe "#deliver!" do
    before do
      # Mock AWS SES client
      @mock_ses_client = double('SES Client')
      allow(Aws::SES::Client).to receive(:new).and_return(@mock_ses_client)
      
      # Mock successful response
      @mock_response = double('Response', message_id: 'test-message-id')
      allow(@mock_ses_client).to receive(:send_email).and_return(@mock_response)
    end

    it "sends email via SES" do
      expect(@mock_ses_client).to receive(:send_email).with(
        hash_including(
          source: Constants::Email::FROM_ADDRESS,
          destination: hash_including(
            to_addresses: ['test@example.com']
          ),
          message: hash_including(
            subject: hash_including(data: 'Test Email'),
            body: hash_including(
              text: hash_including(data: 'This is a test email'),
              html: hash_including(data: 'This is a test email')
            )
          )
        )
      )

      result = delivery_method.deliver!(mail)
      expect(result).to eq(@mock_response)
    end

    it "handles SES errors gracefully" do
      error = Aws::SES::Errors::ServiceError.new(nil, 'Test error')
      allow(@mock_ses_client).to receive(:send_email).and_raise(error)
      allow(Rails.logger).to receive(:error)

      expect { delivery_method.deliver!(mail) }.to raise_error(Aws::SES::Errors::ServiceError)
      expect(Rails.logger).to have_received(:error).with("SES email delivery failed: Test error")
    end

    it "includes reply-to addresses when present" do
      mail.reply_to = ['reply@example.com']
      
      expect(@mock_ses_client).to receive(:send_email).with(
        hash_including(
          reply_to_addresses: ['reply@example.com']
        )
      )

      delivery_method.deliver!(mail)
    end

    it "handles multipart emails correctly" do
      mail.html_part = mail.text_part = nil
      mail.body = "Plain text body"
      
      expect(@mock_ses_client).to receive(:send_email).with(
        hash_including(
          message: hash_including(
            body: hash_including(
              text: hash_including(data: 'Plain text body'),
              html: hash_including(data: 'Plain text body')
            )
          )
        )
      )

      delivery_method.deliver!(mail)
    end
  end
end 