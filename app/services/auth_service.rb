class AuthService < BaseService
  def self.user_from_token(token:)
    begin
      # Test if the token is valid
      decoded_token = JWT.decode(token, self.verification_key, true, { algorithm: 'HS256' })

      # Get the user id and account id from the token
      user_id = decoded_token[0]['user_id']
      user = User.find(user_id)
      return user if user.present?
      raise "User not found id: #{user_id}"
    rescue StandardError => e
      Rails.logger.warn("Error decoding token: #{e.message}")
      return nil
    end
  end

  def self.generate_token_for_user(user:)
    payload = {
      user_id: user.id,
      account_id: user.account_id,
      exp: Time.now.to_i + (30 * 24 * 60 * 60) # 30 days from now
    }
    return JWT.encode(payload, self.verification_key, 'HS256')
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
        return JWT.encode(payload, self.verification_key, 'HS256')
      else
        raise "Invalid password"
      end
    rescue StandardError => e
      Rails.logger.error("Error generating token: #{e.message}")
      return nil
    end
  end

  def self.verification_key
    ENV.fetch("SECRET_KEY_BASE")
  end
end
