class PlaidAccountsController < ApplicationController
  skip_before_action :require_authenticated_user!, only: [:update_all]

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
    token = params[:token]
    if token != ENV.fetch("UPDATE_ALL_TOKEN")
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end

    Rails.logger.info("Updating all accounts information from Plaid")
    Account.find_each do |account|
      service = PlaidService.new(account_id: account.id)
      service.sync_transactions
    end
    Rails.logger.info("Update all accounts complete")
    render json: { message: "Updates complete" }, status: :ok
  end
end
