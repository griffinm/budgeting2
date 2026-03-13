class TagReportsController < ApplicationController
  # GET /api/tag_reports
  def index
    @tag_reports = current_user.account.tag_reports.includes(:tag_report_tags).order(name: :asc)
  end

  # POST /api/tag_reports
  def create
    @tag_report = current_user.account.tag_reports.new(tag_report_params)
    @tag_report.user = current_user
    if @tag_report.save
      render :show
    else
      render json: { errors: @tag_report.errors.full_messages }, status: :bad_request
    end
  end

  # DELETE /api/tag_reports/:id
  def destroy
    @tag_report = current_user.account.tag_reports.find(params[:id])
    if @tag_report.destroy
      render json: { message: 'Tag report deleted' }, status: :ok
    else
      render json: { errors: @tag_report.errors.full_messages }, status: :bad_request
    end
  end

  private

  def tag_report_params
    params.require(:tag_report).permit(:name, :description, tag_report_tags_attributes: [:id, :tag_id, :role, :_destroy])
  end
end
