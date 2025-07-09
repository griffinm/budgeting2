class ApplicationMailer < ActionMailer::Base
  default from: Constants::Email::FROM_ADDRESS
  layout 'mailer'
end 