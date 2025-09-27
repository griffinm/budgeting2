class MerchantGroupsController < ApplicationController
  def index
    @merchant_groups = current_user.account.merchant_groups.includes(:primary_merchant, :merchants)
  end

  def show
    @merchant_group = current_user.account.merchant_groups.includes(:merchants, :primary_merchant).find(params[:id])
  end

  def create
    @merchant_group = current_user.account.merchant_groups.build(merchant_group_params)
    
    if @merchant_group.save
      render :show, status: :created
    else
      render json: { errors: @merchant_group.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @merchant_group = current_user.account.merchant_groups.find(params[:id])
    
    if @merchant_group.update(merchant_group_params)
      render :show
    else
      render json: { errors: @merchant_group.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @merchant_group = current_user.account.merchant_groups.find(params[:id])
    @merchant_group.destroy
    head :no_content
  end

  def spend_stats
    months_back = (params[:months_back] || 6).to_i
    merchant_group_id = params[:id]
    merchant_group_service = MerchantGroupSpendService.new(merchant_group_id: merchant_group_id, current_user: current_user)

    render json: {
      monthlySpend: merchant_group_service.monthly_spend(months_back: months_back),
      allTimeSpend: (merchant_group_service.all_time_spend || 0).abs,
    }
  end

  def add_merchant
    @merchant_group = current_user.account.merchant_groups.find(params[:id])
    merchant = current_user.account.merchants.find(params[:merchant_id])
    
    if @merchant_group.add_merchant(merchant)
      render :show
    else
      render json: { errors: ["Failed to add merchant to group"] }, status: :unprocessable_entity
    end
  end

  def remove_merchant
    @merchant_group = current_user.account.merchant_groups.find(params[:id])
    merchant = current_user.account.merchants.find(params[:merchant_id])
    
    if @merchant_group.remove_merchant(merchant)
      render :show
    else
      render json: { errors: ["Failed to remove merchant from group"] }, status: :unprocessable_entity
    end
  end

  def set_primary_merchant
    @merchant_group = current_user.account.merchant_groups.find(params[:id])
    merchant = current_user.account.merchants.find(params[:merchant_id])
    
    if @merchant_group.set_primary_merchant(merchant)
      render :show
    else
      render json: { errors: ["Failed to set primary merchant"] }, status: :unprocessable_entity
    end
  end

  def suggest_groups
    merchant = current_user.account.merchants.find(params[:merchant_id])
    grouping_service = MerchantGroupingService.new(account_id: current_user.account_id)
    suggestions = grouping_service.suggest_groups_for_merchant(merchant)
    
    render json: {
      suggestions: suggestions.map do |suggestion|
        {
          merchant: {
            id: suggestion[:merchant].id,
            name: suggestion[:merchant].merchant_name,
            customName: suggestion[:merchant].custom_name
          },
          reason: suggestion[:reason],
          confidence: suggestion[:confidence]
        }
      end
    }
  end

  def auto_group
    threshold = params[:threshold]&.to_f || 0.8
    grouping_service = MerchantGroupingService.new(account_id: current_user.account_id)
    grouped_count = grouping_service.auto_group_similar_merchants(threshold: threshold)
    
    render json: { 
      message: "Successfully grouped #{grouped_count.length} merchants",
      grouped_merchant_ids: grouped_count
    }
  end

  private

  def merchant_group_params
    params.require(:merchant_group).permit(:name, :description, :primary_merchant_id)
  end
end
