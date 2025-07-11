class UsersController < ApplicationController

  skip_before_action :require_authenticated_user!, only: [:login, :create]
  skip_before_action :check_transaction_updates, only: [:login, :create]

  # POST /users/login
  def login
    token = AuthService.generate_token(email: params[:email], password: params[:password])

    if token
      user = AuthService.user_from_token(token: token)
      render json: { user: user.as_json, token: token }, status: :ok
    else
      render json: { messages: ["Invalid email or password"] }, status: :unauthorized
    end
  end

  def current
    render json: current_user.as_json, status: :ok
  end

  def create
    user = User.create!(user_params)
    render json: { user: user }, status: :created
  end

  # GET /accounts/:account_id/users
  def index
    account_id = params[:account_id]
    if account_id.to_s != current_user.account_id.to_s
      render json: { messages: ["You are not authorized to access this account. Account ID: #{account_id}, Current User Account ID: #{current_user.account_id}"] }, status: :unauthorized
      return
    end

    @users = Account.find(account_id).users
  end

  # PATCH /users/current
  def update
    if current_user.update(user_params)
      # Create a new token for the user
      token = AuthService.generate_token_for_user(user: current_user)

      render json: { user: current_user.as_json, token: token }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private def user_params
    params.require(:user).permit(:email, :first_name, :last_name, :password)
  end

end
