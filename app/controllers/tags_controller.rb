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
