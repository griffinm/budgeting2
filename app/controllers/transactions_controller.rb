class TransactionsController < ApplicationController

  def index
      @page, @transactions = pagy(
        TransactionSearchService.new(
          account_id: current_user.account_id,
          user_id: current_user.id,
          start_date: search_params[:start_date],
          end_date: search_params[:end_date],
          merchant_id: search_params[:merchant_id],
          merchant_name: search_params[:merchant_name],
          plaid_category_primary: search_params[:plaid_category_primary],
          plaid_category_detail: search_params[:plaid_category_detail],
          payment_channel: search_params[:payment_channel],
          transaction_type: search_params[:transaction_type],
          check_number: search_params[:check_number],
          currency_code: search_params[:currency_code],
          pending: search_params[:pending],
          search_term: search_params[:search_term]
        ).call
      )
  end

  private def search_params
    params.permit(
      :start_date,
      :end_date,
      :merchant_id,
      :merchant_name,
      :plaid_category_primary,
      :plaid_category_detail,
      :payment_channel,
      :transaction_type,
      :check_number,
      :currency_code,
      :pending,
      :search_term,
    )
  end

end
