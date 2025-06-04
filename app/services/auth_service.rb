class AuthService < BaseService
  def user_from_token(token:)
    decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
    user_id = decoded_token[0]['user_id']
    User.find(user_id)
  end

  def generate_token(user_id:)
    JWT.encode({ user_id: user_id }, Rails.application.credentials.secret_key_base, 'HS256')
  end
end
