class TransactionsController < ApplicationController

  # GET /transactions
  def index
      page_num = pagination_params[:page]
      items_per_page = pagination_params[:per_page]
      
      transactions_query = TransactionSearchService.new(
        account_id: current_user.account_id,
        user_id: current_user.id,
        start_date: search_params[:start_date],
        end_date: search_params[:end_date],
        merchant_id: search_params[:merchant_id],
        merchant_name: search_params[:merchant_name],
        transaction_type: search_params[:transaction_type],
        check_number: search_params[:check_number],
        search_term: search_params[:search_term],
        amount_greater_than: search_params[:amount_greater_than],
        amount_less_than: search_params[:amount_less_than],
        amount_equal_to: search_params[:amount_equal_to],
        has_no_category: search_params[:has_no_category],
        needs_review: search_params[:needs_review],
        merchant_tag_id: search_params[:merchant_tag_id],
        merchant_group_id: search_params[:merchant_group_id],
        plaid_account_ids: search_params[:plaid_account_ids],
        tag_ids: search_params[:tag_ids],
        omit_tag_ids: search_params[:omit_tag_ids],
      ).call
      
      @page, @transactions = pagy(
        transactions_query,
        items: items_per_page,
        page: page_num,
        limit: items_per_page
      )
  end

  # GET /transactions/:id
  def show
    @transaction = PlaidTransaction
      .base_query_for_api(current_user.account_id)
      .find(params[:id])
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

    type_changed_by_user = transaction_params[:transaction_type].present?
    attrs = transaction_params.to_h
    attrs[:classification_source] = 'user' if type_changed_by_user

    # Category drives type: assigning a category re-types the transaction,
    # unless this same request explicitly set a type (explicit type wins).
    # Removing a category (null) never re-types.
    assigned_tag = if transaction_params[:merchant_tag_id].present?
      current_user.account.merchant_tags.find_by(id: transaction_params[:merchant_tag_id])
    end
    if assigned_tag && !type_changed_by_user
      attrs[:transaction_type] = assigned_tag.tag_type
      attrs[:classification_source] = 'user'
    end

    if @transaction.update(attrs)
      # If the transaction is being updated to use the default category,
      # update all transactions for the merchant to have the same category
      # and update the merchant's default category to the new category.
      # When the type was part of this update, propagate it the same way.
      if update_all_transactions
        propagated = { merchant_tag_id: @transaction.merchant_tag_id }
        merchant_defaults = { default_merchant_tag_id: @transaction.merchant_tag_id }

        if type_changed_by_user
          propagated[:transaction_type] = @transaction.transaction_type
          propagated[:classification_source] = 'merchant_default'
          merchant_defaults[:default_transaction_type] = @transaction.transaction_type
        elsif assigned_tag
          # The category's type follows the category to the siblings. The
          # merchant's default_transaction_type stays nil so the category
          # keeps driving classification of future transactions.
          propagated[:transaction_type] = @transaction.transaction_type
          propagated[:classification_source] = 'merchant_default'
        end

        @transaction.account.plaid_transactions
          .where(merchant_id: merchant_id)
          .update_all(propagated)

        current_user.account.merchants
          .find_by(id: merchant_id)
          .update(merchant_defaults)
      end

      render :show
    else
      render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /transactions/:id/split
  def split
    transaction = current_user.account.plaid_transactions.find(params[:id])
    result = TransactionSplitService
      .new(transaction: transaction, account: current_user.account)
      .split(split_params[:children])

    render_split_result(result)
  end

  # DELETE /transactions/:id/split
  def unsplit
    transaction = current_user.account.plaid_transactions.find(params[:id])
    result = TransactionSplitService
      .new(transaction: transaction, account: current_user.account)
      .unsplit

    render_split_result(result)
  end

  private def render_split_result(result)
    if result[:errors].present?
      render json: { errors: result[:errors] }, status: :unprocessable_entity
    else
      @transaction = PlaidTransaction
        .base_query_for_api(current_user.account_id)
        .find(result[:transaction].id)
      render :show
    end
  end

  private def split_params
    params.permit(children: [:amount, :name, :merchant_tag_id])
  end

  private def search_params
    params.permit(
      :start_date,
      :end_date,
      :merchant_id,
      :merchant_name,
      :transaction_type,
      :check_number,
      :currency_code,
      :search_term,
      :amount_greater_than,
      :amount_less_than,
      :amount_equal_to,
      :has_no_category,
      :needs_review,
      :merchant_tag_id,
      :merchant_group_id,
      :page,
      :per_page,
      plaid_account_ids: [],
      tag_ids: [],
      omit_tag_ids: [],
    )
  end

  private def update_transaction_meta_params
    params.permit(:merchant_id, :use_as_default)
  end

  private def transaction_params
    params.require(:transaction).permit(:transaction_type, :merchant_tag_id, :note)
  end
end
