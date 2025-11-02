class DataController < ApplicationController
  before_action :format_params

  # GET /api/data/total_for_date_range
  def total_for_date_range
    transaction_type = params[:transaction_type] || 'expense'
    start_date = params[:start_date] || Date.today - 1.month
    end_date = params[:end_date] || Date.today

    amount = PlaidTransaction.base_query_for_api(current_user.account.id)
      .send(transaction_type)
      .where(date: start_date..end_date)
      .all
      .sum(:amount)

    render json: {
      transactionType: transaction_type,
      startDate: start_date,
      endDate: end_date,
      total: amount,
    }
  end

  # GET /api/data/spend_moving_average
  def spend_moving_average
    @spend_moving_average = MonthlySpendService.new(current_user.id).moving_average(months_back: 6, transaction_type: 'expense')

    render json: @spend_moving_average
  end

  # GET /api/data/income_moving_average
  def income_moving_average
    @income_moving_average = MonthlySpendService.new(current_user.id).moving_average(months_back: 6, transaction_type: 'income')

    render json: @income_moving_average
  end


  # GET /api/data/profit_and_loss
  def profit_and_loss
    months_back = params[:months_back] || 12
    @profit_and_loss = ProfitAndLossService.new(account_id: current_user.account.id)
      .profit_and_loss(months_back: months_back)
    render json: @profit_and_loss
  end

  private def format_params
    begin
      params[:month] = params[:month].to_i || Date.today.month
      params[:year] = params[:year].to_i || Date.today.year
    rescue
      render json: { error: 'Invalid month or year' }, status: :bad_request
      return false
    end
  end
end
