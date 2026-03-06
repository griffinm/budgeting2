class TransactionTagsController < ApplicationController
  # POST /api/transaction_tags
  def create
    @transaction_tag = TagPlaidTransaction.new(create_params)
    @transaction_tag.user = current_user
    if @transaction_tag.save
      render :show
    else
      render json: { errors: @transaction_tag.errors.full_messages }, status: :bad_request
    end
  end

  # DELETE /api/transaction_tags/:id
  def destroy
    @transaction_tag = current_user.account.tag_plaid_transactions.find(params[:id])
    if @transaction_tag.destroy
      render json: { message: 'Transaction tag removed' }, status: :ok
    else
      render json: { errors: @transaction_tag.errors.full_messages }, status: :bad_request
    end
  end

  private

  def create_params
    params.require(:transaction_tag).permit(:tag_id, :plaid_transaction_id)
  end
end
