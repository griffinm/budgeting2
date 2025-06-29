class PlaidAccountsController < ApplicationController
  def index
    @plaid_accounts = current_user.account.plaid_accounts
  end
end
