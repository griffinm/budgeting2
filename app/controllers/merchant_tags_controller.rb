class MerchantTagsController < ApplicationController
  # GET /api/merchant_tags
  def index
    @merchant_tags = current_user.account.merchant_tags.order(name: :asc)
  end

  # GET /api/merchant_tags/:id
  def show
    @merchant_tag = current_user.account.merchant_tags.find(params[:id])
  end

  # POST /api/merchant_tags
  def create
    @merchant_tag = current_user.account.merchant_tags.new(create_params)
    @merchant_tag.user = current_user
    if @merchant_tag.save
      render :show
    else
      render json: { errors: @merchant_tag.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/merchant_tags/:id
  def update
    @merchant_tag = current_user.account.merchant_tags.find(params[:id])
    if @merchant_tag.update(update_params)
      render :show
    else
      render json: { errors: @merchant_tag.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/merchant_tags/:id
  def destroy
    @merchant_tag = current_user.account.merchant_tags.find(params[:id])
    if @merchant_tag.destroy
      render json: { message: 'Merchant tag deleted' }, status: :ok
    else
      render json: { errors: @merchant_tag.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/merchant_tags/spend_stats
  # GET /api/merchant_tags/:merchant_tag_id/spend_stats
  def spend_stats
    start_date = params[:start_date] || 6.months.ago.to_date
    end_date = params[:end_date] || Date.today
    merchant_tag_service = MerchantTagService.new(
      account_id: current_user.account_id,
      user_id: current_user.id,
    )
    @data = []
    
    if params[:merchant_tag_id].present?
      @data = merchant_tag_service.spend_stats_for_tag(
        tag_id: params[:merchant_tag_id],
        months_back: params[:months_back],
      )
      render :spend_stats_for_one
    else
      @data = merchant_tag_service.spend_stats_for_all_tags(start_date: start_date, end_date: end_date)
      @all_tags = current_user.account.merchant_tags
      render :spend_stats_for_all
    end
  end
  

  private

  def update_params
    params.require(:merchant_tag).permit(:name, :parent_merchant_tag_id, :target_budget)
  end

  def create_params
    params.require(:merchant_tag).permit(:name, :parent_merchant_tag_id, :target_budget)
  end
end
