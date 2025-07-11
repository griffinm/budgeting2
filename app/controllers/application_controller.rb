include Pagy::Backend

class ApplicationController < ActionController::API
  before_action :require_authenticated_user!
  before_action :set_pagination_params

  def pagination_params
    {
      page: params[:page] || 1,
      per_page: params[:per_page] || 25
    }
  end

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
  
  def set_pagination_params
    @page = params[:currentPage] || 1
    @per_page = params[:perPage] || 25
    request.params.delete(:currentPage)
    request.params.delete(:perPage)
    request.params[:page] = @page
    request.params[:per_page] = @per_page
  end

  def get_user
    token = request.headers["x-budgeting-token"]
    return false if token.blank?

    @current_user = AuthService.user_from_token(token: token)
  end
end
