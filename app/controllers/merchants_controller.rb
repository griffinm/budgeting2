class MerchantsController < ApplicationController
  def index
    @page, @merchants = pagy(
      MerchantSearchService.new(
        account_id: current_user.account_id,
        user_id: current_user.id,
        search_term: params[:search_term],
        merchant_tag_id: params[:merchant_tag_id],
        merchant_group_id: params[:merchant_group_id],
      ).call,
      page: pagination_params[:page],
      items: pagination_params[:per_page]
    )
  end

  # GET /api/merchants/:id
  def show
    @merchant = current_user.account.merchants.includes(:merchant_tag, :default_tags, merchant_group: :merchants).find(params[:id])
  end

  # PATCH /api/merchants/:id
  def update
    @merchant = current_user.account.merchants.find(params[:id])

    ActiveRecord::Base.transaction do
      unless @merchant.update(update_params)
        render json: { errors: @merchant.errors.full_messages }, status: :unprocessable_entity
        return
      end

      if params[:default_tag_ids].is_a?(Array)
        new_ids = params[:default_tag_ids].map(&:to_i)
        current_ids = @merchant.merchant_default_tags.pluck(:tag_id)

        ids_to_add = new_ids - current_ids
        ids_to_remove = current_ids - new_ids

        @merchant.merchant_default_tags.where(tag_id: ids_to_remove).destroy_all if ids_to_remove.any?
        ids_to_add.each do |tag_id|
          @merchant.merchant_default_tags.create!(tag_id: tag_id, user_id: current_user.id)
        end
      end

      @merchant.propagate_defaults_to_group

      if params[:apply_to_existing].present? && ActiveModel::Type::Boolean.new.cast(params[:apply_to_existing])
        @merchant.apply_default_merchant_tag_to_all_transactions
        @merchant.apply_default_transaction_type_to_all_transactions if @merchant.default_transaction_type.present?
        @merchant.apply_default_tags_to_all_transactions
      end
    end

    @merchant.reload
    render :show
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
    params.fetch(:merchant, {}).permit(:custom_name, :default_transaction_type, :default_merchant_tag_id)
  end
end
