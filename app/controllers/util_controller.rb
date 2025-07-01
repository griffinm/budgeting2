class UtilController < ApplicationController
  before_action :check_token!
  skip_before_action :require_authenticated_user!

  def update_all
    Rails.logger.info("Updating all accounts information from Plaid")
    Account.find_each do |account|
      service = PlaidService.new(account_id: account.id)
      service.sync_transactions
      service.update_account_balances
    end

    render json: { message: "Updates complete" }
  end

  private def check_token!
    token = params[:token]

    if token != ENV.fetch("UPDATE_ALL_TOKEN")
      render json: { error: "Unauthorized" }, status: :unauthorized
      return false
    end

    return true
  end
end