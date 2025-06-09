class MerchantsController < ApplicationController
  def index
    @merchants, @page = pagy(
      Merchant.where(account_id: current_user.account_id)
    )
  end
end
