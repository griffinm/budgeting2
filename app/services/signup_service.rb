class SignupService < BaseService
  def self.call(user_params)
    new(user_params).call
  end

  def initialize(user_params)
    @user_params = user_params
    @account = nil
    @user = nil
    @token = nil
    @errors = []
  end

  def call
    ActiveRecord::Base.transaction do
      create_account
      create_user
      generate_token
    end

    # Create default merchant tags
    DefaultMerchantTagsService.create_for_account(@account, @user)

    if @errors.any?
      { success: false, errors: @errors }
    else
      { success: true, user: @user, token: @token }
    end
  rescue ActiveRecord::RecordInvalid => e
    { success: false, errors: e.record.errors.full_messages }
  rescue StandardError => e
    Rails.logger.error("Signup error: #{e.message}")
    { success: false, errors: [e.message] }
  end

  private

  def create_account
    @account = Account.create!
  end

  def create_user
    @user = User.create!(
      account: @account,
      email: @user_params[:email],
      first_name: @user_params[:first_name],
      last_name: @user_params[:last_name],
      password: @user_params[:password]
    )
  end

  def generate_token
    @token = AuthService.generate_token_for_user(user: @user)
  end
end

