class MerchantTagsController < ApplicationController
  # GET /api/merchant_tags
  def index
    @merchant_tags = current_user.account.merchant_tags.order(name: :asc)
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

  private

  def update_params
    params.require(:merchant_tag).permit(:name, :parent_merchant_tag_id)
  end

  def create_params
    params.require(:merchant_tag).permit(:name, :parent_merchant_tag_id)
  end
end