class AuthService < BaseService 
  def self.user_from_token(token:)
    begin
      # Test if the token is valid
      decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })

      # Get the user id and account id from the token
      user_id = decoded_token[0]['user_id']
      User.find(user_id)
    rescue StandardError => e
      Rails.logger.warn("Error decoding token: #{e.message}")
      return nil
    end
  end

  def self.generate_token(email:, password:)
    begin
      user = User.find_by(email: email)
      if user.nil?
        raise "User not found"
      end

      if user.authenticate(password)
        payload = {
          user_id: user.id,
          account_id: user.account_id,
          exp: Time.now.to_i + (30 * 24 * 60 * 60) # 30 days from now
        }
        return JWT.encode(payload, Rails.application.credentials.secret_key_base, 'HS256')
      else
        raise "Invalid password"
      end
    rescue StandardError => e
      Rails.logger.error("Error generating token: #{e.message}")
      return nil
    end
  end
end
