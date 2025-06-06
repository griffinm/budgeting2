class ApplicationController < ActionController::API
  before_action :require_authenticated_user!

  def current_user
    @current_user ||= get_user
  end

  def require_authenticated_user!
    unless current_user
      render json: { error: "Unauthorized" }, status: :unauthorized
      return false
    end

    return true
  end
  
  def get_user
    token = request.headers["x-budgeting-token"]
    return false if token.blank?

    @current_user = AuthService.user_from_token(token: token)
  end
end
