namespace :ses do
  desc "Test SES configuration and send a test email"
  task test: :environment do
    email = ENV['EMAIL'] || 'test@example.com'
    
    puts "Testing SES configuration..."
    puts "Sending test email to: #{email}"
    
    begin
      # Test SES client connection
      ses_client = Aws::SES::Client.new
      identity_response = ses_client.list_identities
      puts "✓ SES client connection successful"
      puts "✓ Verified identities: #{identity_response.identities.join(', ')}"
      
      # Send test email
      test_mail = ActionMailer::Base.mail(
        from: Constants::Email::FROM_ADDRESS,
        to: email,
        subject: 'SES Test Email',
        body: "This is a test email sent via AWS SES at #{Time.current}"
      )
      
      result = test_mail.deliver_now
      puts "✓ Test email sent successfully!"
      puts "✓ Message ID: #{result.message_id}" if result.respond_to?(:message_id)
      
    rescue Aws::SES::Errors::ServiceError => e
      puts "✗ SES Error: #{e.message}"
      puts "Please check your AWS credentials and SES configuration."
    rescue => e
      puts "✗ Unexpected error: #{e.message}"
      puts e.backtrace.first(5).join("\n")
    end
  end

  desc "Verify SES domain verification status"
  task verify_domain: :environment do
    domain = ENV['DOMAIN'] || 'budgeting2.com'
    
    puts "Checking SES domain verification for: #{domain}"
    
    begin
      ses_client = Aws::SES::Client.new
      
      # Check domain verification status
      response = ses_client.get_identity_verification_attributes(
        identities: [domain]
      )
      
      if response.verification_attributes[domain]
        status = response.verification_attributes[domain].verification_status
        puts "✓ Domain verification status: #{status}"
        
        if status == 'Success'
          puts "✓ Domain is verified and ready to send emails"
        else
          puts "✗ Domain is not verified. Please verify #{domain} in SES console"
        end
      else
        puts "✗ Domain #{domain} not found in SES"
      end
      
    rescue Aws::SES::Errors::ServiceError => e
      puts "✗ SES Error: #{e.message}"
    end
  end

  desc "Check SES sending limits and usage"
  task limits: :environment do
    puts "Checking SES sending limits..."
    
    begin
      ses_client = Aws::SES::Client.new
      
      # Get sending limits
      response = ses_client.get_send_quota
      
      puts "✓ Daily sending quota: #{response.max_24_hour_send}"
      puts "✓ Current 24-hour send: #{response.sent_last_24_hours}"
      puts "✓ Maximum send rate: #{response.max_send_rate} emails per second"
      
      remaining = response.max_24_hour_send - response.sent_last_24_hours
      puts "✓ Remaining sends today: #{remaining}"
      
    rescue Aws::SES::Errors::ServiceError => e
      puts "✗ SES Error: #{e.message}"
    end
  end
end 