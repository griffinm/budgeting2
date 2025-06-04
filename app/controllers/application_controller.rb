class ApplicationController < ActionController::API
  
  def current_user
    @current_user ||= authenticate_request
  end
  
  def authenticate_request
    token = request.headers["x-budgeting-jwt"]
    if token.blank?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end

    begin
      @current_user = AuthService.new.user_from_token(token: token)
    end
  end
end
