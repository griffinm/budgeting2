class TagsController < ApplicationController
  # GET /api/tags
  def index
    @tags = current_user.account.tags.order(name: :asc)
  end

  # POST /api/tags
  def create
    @tag = current_user.account.tags.new(tag_params)
    @tag.user = current_user
    if @tag.save
      render :show
    else
      render json: { errors: @tag.errors.full_messages }, status: :bad_request
    end
  end

  # GET /api/tags/spend_stats
  def spend_stats
    tag_ids = params[:tag_ids] || []
    omit_tag_ids = params[:omit_tag_ids] || []
    months_back = (params[:months_back] || 6).to_i
    service = TagService.new(account_id: current_user.account_id, user_id: current_user.id)
    @data = service.spend_stats(tag_ids: tag_ids, months_back: months_back, omit_tag_ids: omit_tag_ids)
    render :spend_stats
  end

  private

  def tag_params
    params.require(:tag).permit(:name)
  end
end
