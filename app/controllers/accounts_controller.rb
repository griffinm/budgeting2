class AccountsController < ApplicationController
  def create
    account = Account.create!
    render json: { account: account }, status: :created
  end
end
