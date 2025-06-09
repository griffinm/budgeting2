class MerchantSearchService < BaseService
  def initialize(account_id:, search_term: nil)
    @account_id = account_id
    @search_term = search_term
  end

  def call
    merchants = Merchant.joins(:account).where(accounts: { id: @account_id })

    if @search_term.present? || @search_term.blank?
      merchants = merchants.where("merchants.merchant_name ILIKE ? OR merchants.custom_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end

    merchants
  end
end