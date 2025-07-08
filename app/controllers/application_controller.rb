include Pagy::Backend

class ApplicationController < ActionController::API
  before_action :require_authenticated_user!
  before_action :set_pagination_params
  before_action :check_transaction_updates

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

  def check_transaction_updates
    redis_service = RedisService.new(user: current_user)
    last_sync_time = redis_service.get_last_sync_time
    is_updating = redis_service.get_is_updating_transactions?

    if is_updating
      return
    end

    if last_sync_time.blank? || last_sync_time < Constants::TransactionUpdates::FREQUENCY.ago
      redis_service.set_is_updating_transactions(true)
      redis_service.set_last_sync_time(Time.now)
      Transactions::SyncForAccountJob.perform_async(account_id: current_user.account_id)
      redis_service.set_is_updating_transactions(false)
    end
  end

  def get_user
    token = request.headers["x-budgeting-token"]
    return false if token.blank?

    @current_user = AuthService.user_from_token(token: token)
  end
end
