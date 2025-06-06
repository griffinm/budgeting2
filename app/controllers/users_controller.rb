class UsersController < ApplicationController

  skip_before_action :require_authenticated_user!, only: [:login, :create]

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
    render json: current_user, status: :ok
  end

  def create
    user = User.create!(user_params)
    render json: { user: user }, status: :created
  end

  private def user_params
    params.require(:user).permit(:email, :first_name, :last_name, :password)
  end

end
