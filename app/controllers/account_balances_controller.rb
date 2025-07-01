class AccountBalancesController < ApplicationController
  
  def index
    @account_balances = AccountBalance.current_for_account(current_user.account.id)
    @accounts = current_user.account.plaid_accounts
  end
end