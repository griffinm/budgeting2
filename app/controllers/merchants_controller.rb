class MerchantsController < ApplicationController
  def index
    @page, @merchants = pagy(
      Merchant.where(account_id: current_user.account_id).order(:id)
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
    params.require(:merchant).permit(:custom_name)
  end
end
