class MerchantSearchService < BaseService
  VALID_SORT_FIELDS = %w[name transaction_count].freeze
  VALID_SORT_DIRECTIONS = %w[asc desc].freeze
  TRANSACTION_COUNT_SQL = "(SELECT COUNT(*) FROM plaid_transactions WHERE plaid_transactions.merchant_id = merchants.id)"

  def initialize(account_id:, user_id:, search_term: nil, merchant_tag_id: nil, merchant_group_id: nil, sort_by: nil, sort_direction: nil)
    @account_id = account_id
    @user_id = user_id

    # Optional params
    @merchant_tag_id = merchant_tag_id
    @merchant_group_id = merchant_group_id
    @search_term = search_term
    @sort_by = VALID_SORT_FIELDS.include?(sort_by) ? sort_by : "name"
    @sort_direction = VALID_SORT_DIRECTIONS.include?(sort_direction) ? sort_direction : "asc"
  end

  def call
    merchants = Merchant.joins(:account)
      .includes(:default_merchant_tag, :account, :default_tags, merchant_group: [:primary_merchant, :merchants])
      .select("merchants.*, #{TRANSACTION_COUNT_SQL} AS transaction_count")
      .where(accounts: { id: @account_id })

    if @search_term.present?
      merchants = merchants.where("merchants.merchant_name ILIKE ? OR merchants.custom_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
    end

    if @merchant_tag_id.present?
      # Find merchants that have a transaction with the merchant tag or are the default merchant tag for the merchant
      merchants = merchants.left_joins(:plaid_transactions)
        .where("plaid_transactions.merchant_tag_id = ? OR merchants.default_merchant_tag_id = ?", @merchant_tag_id, @merchant_tag_id)
        .distinct
    end

    if @merchant_group_id.present?
      merchants = merchants.where(merchant_group_id: @merchant_group_id)
    end

    merchants = apply_sort(merchants)

    merchants
  end

  private

  def apply_sort(merchants)
    case @sort_by
    when "transaction_count"
      merchants.order(Arel.sql("#{TRANSACTION_COUNT_SQL} #{@sort_direction}"))
    else
      merchants.order("merchants.merchant_name #{@sort_direction}")
    end
  end
end
