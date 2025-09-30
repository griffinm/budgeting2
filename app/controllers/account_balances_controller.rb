class AccountBalancesController < ApplicationController
  
  # GET /api/account_balances
  def index
    @account_balances = current_user.account_balances.latest_per_account.includes(:plaid_account)
  end
  
end
