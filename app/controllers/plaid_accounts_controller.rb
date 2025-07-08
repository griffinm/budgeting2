class PlaidAccountsController < ApplicationController
  def index
    @plaid_accounts = current_user.plaid_accounts
  end
end
