class MerchantsController < ApplicationController
  def index
    @page, @merchants = pagy(
      MerchantSearchService.new(
        account_id: current_user.account_id,
        user_id: current_user.id,
        search_term: params[:search_term],
        merchant_tag_id: params[:merchant_tag_id],
        merchant_group_id: params[:merchant_group_id],
      ).call
    )
  end

  # GET /api/merchants/:id
  def show
    @merchant = current_user.account.merchants.includes(:merchant_tag, merchant_group: :merchants).find(params[:id])
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
    merchant = current_user.account.merchants.find(merchant_id)
    merchant_service = MerchantSpendService.new(merchant: merchant, current_user: current_user)

    render json: {
      monthsBack: months_back,
      monthlySpend: merchant_service.monthly_spend(months_back: months_back, include_group: true),
      allTimeSpend: (merchant_service.all_time_spend || 0).abs,
    }
  end

  # GET /api/merchants/:merchant_id/suggest_groups
  def suggest_groups
    begin
      merchant = current_user.account.merchants.find(params[:merchant_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Merchant not found"] }, status: :not_found
      return
    end
    
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

  # POST /api/merchants/:merchant_id/create_group
  def create_group
    begin
      merchant = current_user.account.merchants.find(params[:merchant_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Merchant not found"] }, status: :not_found
      return
    end
    
    group_name = params[:group_name] || merchant.merchant_name
    description = params[:description]
    
    grouping_service = MerchantGroupingService.new(account_id: current_user.account_id)
    group = grouping_service.create_group_with_merchants(
      name: group_name,
      description: description,
      merchants: [merchant]
    )
    
    if group
      render json: { 
        message: "Group created successfully",
        group: {
          id: group.id,
          name: group.name,
          description: group.description
        }
      }
    else
      render json: { errors: ["Failed to create group"] }, status: :unprocessable_entity
    end
  end

  private def update_params
    params.require(:merchant).permit(:custom_name, :default_transaction_type, :default_merchant_tag_id)
  end
end
