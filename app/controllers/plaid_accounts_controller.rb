class PlaidAccountsController < ApplicationController
  def index
    @plaid_accounts = current_user.plaid_accounts.includes(:users)
  end

  # POST /api/users/:user_id/plaid_accounts/:id
  def create
    user_to_add = current_user.account.users.find(params[:user_id])
    plaid_account = current_user.plaid_accounts.find(params[:plaid_account_id])
    plaid_account.users << user_to_add
    render json: { message: "Access updated" }, status: :ok
  end

  # DELETE /api/users/:user_id/plaid_accounts/:id
  def destroy
    user_to_remove = current_user.account.users.find(params[:user_id])
    plaid_account = current_user.plaid_accounts.find(params[:plaid_account_id])
    plaid_account.users.delete(user_to_remove)
    render json: { message: "Access removed" }, status: :ok
  end

  # GET /api/plaid_accounts/update_all
  def update_all
    force_update = params[:force_update] == "true"
    redis_service = RedisService.new(user: current_user)
    last_sync_time = redis_service.get_last_sync_time
    is_updating = redis_service.get_is_updating_transactions?

    if is_updating && !force_update
      render json: {
        message: 'update_already_queued',
        last_sync_time: last_sync_time,
        is_updating: is_updating,
      }, status: :ok
      return
    end

    if last_sync_time.blank? || last_sync_time < Constants::TransactionUpdates::FREQUENCY.ago || force_update
      Transactions::SyncForAccountJob.perform_async(account_id: current_user.account_id, user_id: current_user.id, force_update: force_update)
      redis_service.set_is_updating_transactions(false)
    else
      render json: {
        message: 'update_not_needed',
        last_sync_time: last_sync_time,
        is_updating: is_updating,
      }, status: :ok
      return
    end

    render json: {
      message: 'update_queued',
      last_sync_time: last_sync_time,
      is_updating: is_updating,
    }, status: :ok
  end
end
