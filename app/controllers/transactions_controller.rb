class TransactionsController < ApplicationController

  # GET /transactions
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
          search_term: search_params[:search_term],
          amount_greater_than: search_params[:amount_greater_than],
          amount_less_than: search_params[:amount_less_than],
          amount_equal_to: search_params[:amount_equal_to],
          has_no_category: search_params[:has_no_category],
        ).call
      )
  end

  # PATCH /transactions/:id
  def update
    @transaction = current_user.account.plaid_transactions.find(params[:id])
    update_all_transactions = update_transaction_meta_params[:use_as_default]
    merchant_id = update_transaction_meta_params[:merchant_id]

    if update_all_transactions && merchant_id.nil?
      render json: { errors: 'Merchant ID is required when updating all transactions' }, status: :unprocessable_entity
      return
    end

    if @transaction.update(transaction_params)
      # If the transaction is being updated to use the default category, 
      # update all transactions for the merchant to have the same category
      # and update the merchant's default category to the new category
      if update_all_transactions
        @transaction.account.plaid_transactions
          .where(merchant_id: merchant_id)
          .update_all(merchant_tag_id: @transaction.merchant_tag_id)

        current_user.account.merchants
          .find_by(id: merchant_id)
          .update(default_merchant_tag_id: @transaction.merchant_tag_id)
      end

      render :show
    else
      render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
    end
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
      :amount_greater_than,
      :amount_less_than,
      :amount_equal_to,
      :has_no_category,
    )
  end

  private def update_transaction_meta_params
    params.permit(:merchant_id, :use_as_default)
  end

  private def transaction_params
    params.require(:transaction).permit(:transaction_type, :merchant_tag_id, :note)
  end
end
