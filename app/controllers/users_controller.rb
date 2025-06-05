class UsersController < ApplicationController

  before_action :require_authenticated_user!, except: [:create]

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
