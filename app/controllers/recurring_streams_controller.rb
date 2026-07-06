class RecurringStreamsController < ApplicationController
  # GET /api/recurring_streams
  def index
    streams = current_user.account.recurring_streams
      .includes(merchant: [:default_merchant_tag, :default_tags, merchant_group: [:primary_merchant, :merchants]])

    if params[:status].present?
      unless RecurringStream::STATUSES.include?(params[:status])
        render json: { errors: ["Invalid status: #{params[:status]}"] }, status: :unprocessable_entity
        return
      end
      streams = streams.where(status: params[:status])
    end

    streams = streams.where(active: ActiveModel::Type::Boolean.new.cast(params[:active])) if params[:active].present?

    @page, @recurring_streams = pagy(
      streams.order(active: :desc, predicted_next_date: :asc),
      page: pagination_params[:page],
      items: pagination_params[:per_page]
    )
  end

  # PATCH /api/recurring_streams/:id/confirm
  def confirm
    @recurring_stream = current_user.account.recurring_streams.find(params[:id])

    if @recurring_stream.status == "dismissed"
      render json: { errors: ["Cannot confirm a dismissed stream"] }, status: :unprocessable_entity
      return
    end

    @recurring_stream.confirm!
    render :show
  end

  # PATCH /api/recurring_streams/:id/dismiss
  def dismiss
    @recurring_stream = current_user.account.recurring_streams.find(params[:id])
    @recurring_stream.dismiss!
    render :show
  end

  # POST /api/recurring_streams/detect
  def detect
    result = RecurringDetectionService.new(account_id: current_user.account_id).call
    render json: { message: "Detection complete" }.merge(result)
  end
end
