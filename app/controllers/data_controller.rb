class DataController < ApplicationController
  before_action :format_params

  # GET /api/data/monthly_spend
  def monthly_spend
    month = params[:month] || Date.today.month
    year = params[:year] || Date.today.year

    @transactions = PlaidTransaction.base_query_for_api(current_user.account.id)
      .expense
      .in_month(month, year)
      .all

    render 'data/index'
  end

  # GET /api/data/monthly_income
  def monthly_income
    month = params[:month] || Date.today.month
    year = params[:year] || Date.today.year

    @transactions = PlaidTransaction.base_query_for_api(current_user.account.id)
      .income
      .in_month(month, year)
      .all

    render 'data/index'
  end

  # GET /api/data/average_income
  def average_income
    months_back = params[:months_back] || 1
    @average_income = MonthlySpendService.new(current_user.id)
      .average_income_for_months_back(months_back: months_back)

    render json: { average: @average_income }
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
