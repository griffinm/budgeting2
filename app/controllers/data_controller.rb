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