class MerchantSearchService < BaseService
  def initialize(account_id:, user_id:, search_term: nil, merchant_tag_id: nil)
    @account_id = account_id
    @user_id = user_id

    # Optional params
    @merchant_tag_id = merchant_tag_id
    @search_term = search_term
  end

  def call
    merchants = Merchant.joins(:account)
      .includes(:default_merchant_tag, :account)
      .where(accounts: { id: @account_id })
      .order(merchants: { merchant_name: :asc })

    if @search_term.present?
      merchants = merchants.where("merchants.merchant_name ILIKE ? OR merchants.custom_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end

    if @merchant_tag_id.present?
      # Find merchants that have a transaction with the merchant tag or are the default merchant tag for the merchant
      merchants = merchants.left_joins(:plaid_transactions)
        .where("plaid_transactions.merchant_tag_id = ? OR merchants.default_merchant_tag_id = ?", @merchant_tag_id, @merchant_tag_id)
        .distinct
    end

    merchants
  end
end
