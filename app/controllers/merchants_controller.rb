class MerchantsController < ApplicationController
  def index
    @page, @merchants = pagy(
      MerchantSearchService.new(
        account_id: current_user.account_id,
        search_term: params[:search_term]
      ).call
    )
  end

  def show
    @merchant = current_user.account.merchants.find(params[:id])
  end

  # PATCH /api/merchants/:id
  def update
    @merchant = current_user.account.merchants.find(params[:id])
    if @merchant.update(update_params)
      render :show
    else
      render json: { errors: @merchant.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private def update_params
    params.require(:merchant).permit(:custom_name, :default_transaction_type)
  end
end
