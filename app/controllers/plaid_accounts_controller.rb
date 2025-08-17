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
    PlaidService.new(account_id: current_user.account_id).sync_transactions
    render json: { message: "Updates complete" }, status: :ok
  end
end
