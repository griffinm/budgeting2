module AllConstants
  module TransactionUpdates
    DEVELOPMENT_FREQUENCY = 2.days
    PRODUCTION_FREQUENCY = 12.hours
  end

  module Authentication
    DEVELOPMENT_TOKEN_EXPIRATION_TIME = 30.days
    PRODUCTION_TOKEN_EXPIRATION_TIME = 30.days
  end

  module Email
    DEVELOPMENT_FROM_ADDRESS = 'noreply@scriptmasterg.com'
    PRODUCTION_FROM_ADDRESS = 'noreply@scriptmasterg.com'
  end
end

module Constants
  module TransactionUpdates
    FREQUENCY = Rails.env.production? ? 
      AllConstants::TransactionUpdates::PRODUCTION_FREQUENCY 
      : AllConstants::TransactionUpdates::DEVELOPMENT_FREQUENCY
  end

  module Authentication
    TOKEN_EXPIRATION_TIME = Rails.env.production? ? 
      AllConstants::Authentication::PRODUCTION_TOKEN_EXPIRATION_TIME 
      : AllConstants::Authentication::DEVELOPMENT_TOKEN_EXPIRATION_TIME
  end

  module Email
    FROM_ADDRESS = Rails.env.production? ? 
      AllConstants::Email::PRODUCTION_FROM_ADDRESS 
      : AllConstants::Email::DEVELOPMENT_FROM_ADDRESS
  end
end

