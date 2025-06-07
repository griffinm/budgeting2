class TransactionsController < ApplicationController
  skip_before_action :require_authenticated_user!, only: [:index]

  def index
    @page, @transactions = pagy(
      PlaidTransaction.all_for_account(current_user.account_id)
    )
  end


end
