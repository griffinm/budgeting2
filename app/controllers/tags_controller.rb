class TagsController < ApplicationController
  # GET /api/tags
  def index
    @tags = current_user.account.tags.order(name: :asc)
  end

  # GET /api/tags/:id
  def show
    @tag = current_user.account.tags.find(params[:id])
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

  # PATCH /api/tags/:id
  def update
    @tag = current_user.account.tags.find(params[:id])
    if @tag.update(tag_params)
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

  # DELETE /api/tags/:id
  def destroy
    @tag = current_user.account.tags.find(params[:id])
    if @tag.destroy
      render json: { message: 'Tag deleted' }, status: :ok
    else
      render json: { errors: @tag.errors.full_messages }, status: :bad_request
    end
  end

  private

  def tag_params
    params.require(:tag).permit(:name)
  end
end
