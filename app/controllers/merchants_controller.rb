class MerchantsController < ApplicationController
  def index
    @page, @merchants = pagy(
      MerchantSearchService.new(
        account_id: current_user.account_id,
        search_term: params[:search_term]
      ).call
    )
  end

  # GET /api/merchants/:id
  def show
    @merchant = current_user.account.merchants.includes(:merchant_tags).find(params[:id])
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

  # GET /api/merchants/:id/spend_stats
  def spend_stats
    months_back = (params[:months_back] || 6).to_i
    merchant_id = params[:merchant_id]
    merchant_service = MerchantSpendService.new(merchant_id: merchant_id, current_user: current_user)

    render json: {
      monthlySpend: merchant_service.monthly_spend(months_back: months_back),
      allTimeSpend: merchant_service.all_time_spend,
    }
  end

  private def update_params
    params.require(:merchant).permit(:custom_name, :default_transaction_type, :default_merchant_tag_id)
  end
end
