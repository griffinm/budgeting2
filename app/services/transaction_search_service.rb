# TransactionSearchService
#
# Service for searching and filtering PlaidTransaction records.
# Supports both database queries and Typesense full-text search.
#
# @example Basic usage with database search
#   service = TransactionSearchService.new(
#     account_id: current_user.account_id,
#     user_id: current_user.id
#   )
#   transactions = service.call
#
# @example Search with filters
#   service = TransactionSearchService.new(
#     account_id: current_user.account_id,
#     user_id: current_user.id,
#     start_date: '2024-01-01',
#     end_date: '2024-12-31',
#     transaction_type: 'expense',
#     merchant_tag_id: 5
#   )
#   transactions = service.call
#
# @example Simple Typesense full-text search
#   service = TransactionSearchService.new(
#     account_id: current_user.account_id,
#     user_id: current_user.id
#   )
#   transactions = service.search_typesense_simple('grocery store', per_page: 10, page: 1)
#
# @example Advanced Typesense search with filters
#   service = TransactionSearchService.new(
#     account_id: current_user.account_id,
#     user_id: current_user.id,
#     search_term: 'amazon',
#     start_date: '2024-01-01',
#     transaction_type: 'expense'
#   )
#   transactions = service.search_typesense(per_page: 25, page: 1)
#
class TransactionSearchService < BaseService
  # Initialize the search service with filter parameters
  #
  # @param account_id [Integer] Required. The account ID for access control
  # @param user_id [Integer] Required. The user ID to scope transactions
  # @param start_date [String, Date, nil] Filter transactions on or after this date
  # @param end_date [String, Date, nil] Filter transactions on or before this date
  # @param merchant_id [Integer, nil] Filter by specific merchant ID
  # @param merchant_name [String, nil] Filter by exact merchant name
  # @param transaction_type [String, nil] Filter by type: 'expense', 'income', or 'transfer'
  # @param check_number [String, nil] Filter by check number
  # @param search_term [String, nil] Full-text search term for name/merchant
  # @param amount_greater_than [Float, nil] Filter amounts greater than this value
  # @param amount_less_than [Float, nil] Filter amounts less than this value
  # @param amount_equal_to [Float, nil] Filter amounts equal to this value
  # @param has_no_category [String, nil] When "true", only return uncategorized transactions
  # @param merchant_tag_id [Integer, nil] Filter by category (includes child categories)
  # @param merchant_group_id [Integer, nil] Filter by merchant group
  # @param plaid_account_ids [Array<Integer>, nil] Filter by specific Plaid accounts
  def initialize(
    account_id:,
    user_id:,
    start_date: nil,
    end_date: nil,
    merchant_id: nil,
    merchant_name: nil,
    transaction_type: nil,
    check_number: nil,
    search_term: nil,
    amount_greater_than: nil,
    amount_less_than: nil,
    amount_equal_to: nil,
    has_no_category: nil,
    merchant_tag_id: nil,
    merchant_group_id: nil,
    plaid_account_ids: nil
  )
    @account_id = account_id
    @user_id = user_id
    @start_date = start_date
    @end_date = end_date
    @merchant_id = merchant_id
    @merchant_name = merchant_name
    @transaction_type = transaction_type
    @check_number = check_number
    @search_term = search_term
    @amount_greater_than = amount_greater_than
    @amount_less_than = amount_less_than
    @amount_equal_to = amount_equal_to
    @has_no_category = has_no_category
    @merchant_tag_id = merchant_tag_id
    @merchant_group_id = merchant_group_id
    @plaid_account_ids = plaid_account_ids

    @user = User.find(@user_id)
    @account = Account.find(@account_id)
  end

  # Search transactions using database queries
  #
  # Performs a database query with all configured filters.
  # Supports all filter parameters including amount comparisons and merchant groups.
  #
  # @return [ActiveRecord::Relation<PlaidTransaction>, Hash] Returns relation of transactions,
  #   or hash with :errors key if validation fails
  def call
    errors = check_params
    if errors.any?
      return { errors: errors }
    end
    
    transactions = @user.plaid_transactions
      .joins(:plaid_account, :merchant)
      .includes(
        :plaid_account, 
        :merchant_tag, 
        merchant: [
          :default_merchant_tag,
          { merchant_group: [:primary_merchant, :merchants] }
        ]
      )
      .order(date: :desc)
      
    if @merchant_group_id.present? || @merchant_id.present?
      if @merchant_group_id.present?
        # Group was passed, so ignore the merchant ID
        transactions = transactions.where(merchant_id: Merchant.in_group(@merchant_group_id).pluck(:id))
      else
        # No group was passed, so use the merchant ID
        transactions = transactions.where(merchant_id: @merchant_id)
      end
    end
    
    if @merchant_tag_id.present?
      tag = MerchantTag.find(@merchant_tag_id)
      child_ids = tag.child_ids + [tag.id]
      transactions = transactions.where(merchant_tag_id: child_ids)
    end

    if @has_no_category.present? && @has_no_category == "true"
      transactions = transactions.where(merchant_tag_id: nil)
    end

    if @amount_greater_than.present?
      transactions = transactions.where("amount > ?", @amount_greater_than)
    end

    if @amount_equal_to.present?
      transactions = transactions.where("amount = ?", @amount_equal_to)
    end

    if @amount_less_than.present?
      transactions = transactions.where("amount < ?", @amount_less_than)
    end

    if @start_date.present? || @end_date.present?
      # Simple date filtering without timezone conversion
      # Dates are compared directly as stored in the database
      start_time = @start_date.present? ? Date.parse(@start_date.to_s).beginning_of_day : nil
      end_time = @end_date.present? ? Date.parse(@end_date.to_s).end_of_day : nil
      
      if start_time && end_time
        transactions = transactions.where(date: start_time..end_time)
      elsif start_time
        transactions = transactions.where("date >= ?", start_time)
      elsif end_time
        transactions = transactions.where("date <= ?", end_time)
      end
    end

    if @merchant_name.present?
      transactions = transactions.where(merchant_name: @merchant_name)
    end

    if @transaction_type.present?
      transactions = transactions.where(transaction_type: @transaction_type)
    end

    if @check_number.present?
      transactions = transactions.where(check_number: @check_number)
    end

    if @search_term.present?
      if @search_term.to_f.to_s == @search_term
        # If the search term is a number, search for the amount
        transactions = transactions.where("plaid_transactions.amount = ?", @search_term.to_f)
      else
        # If the search term is not a number, search for the name or merchant name
        transactions = transactions.where("plaid_transactions.name ILIKE ? OR merchants.merchant_name ILIKE ?", "%#{@search_term}%", "%#{@search_term}%")
      end
    end

    if @plaid_account_ids.present? && @plaid_account_ids.is_a?(Array) && @plaid_account_ids.any?
      transactions = transactions.where(plaid_account_id: @plaid_account_ids)
    end
    
    transactions
  end

  # Simple full-text search using Typesense
  #
  # Searches across all indexed text fields (name, merchant_name, note,
  # merchant_tag_name, plaid_account_name) with a single query string.
  # Only applies account_id filter for security.
  #
  # @param query [String] The search query (e.g., "grocery", "amazon prime")
  # @param per_page [Integer] Number of results per page (default: 25)
  # @param page [Integer] Page number, 1-indexed (default: 1)
  #
  # @return [Array<PlaidTransaction>] Array of transactions ordered by relevance
  def search_typesense_simple(query, per_page: 25, page: 1)
    results = TypesenseService.search(
      TransactionIndexer::COLLECTION_NAME,
      query: query.presence || '*',
      query_by: 'name,merchant_name,note,merchant_tag_name,plaid_account_name',
      filter_by: "account_id:=#{@account_id}",
      sort_by: 'date:desc',
      per_page: per_page,
      page: page
    )

    hydrate_typesense_results(results)
  end

  # Advanced search using Typesense with filters
  #
  # Uses @search_term for full-text search and applies configured filters
  # (date range, merchant, transaction type, category, plaid accounts).
  #
  # @param per_page [Integer] Number of results per page (default: 25)
  # @param page [Integer] Page number, 1-indexed (default: 1)
  #
  # @return [Array<PlaidTransaction>, Hash] Array of transactions ordered by relevance,
  #   or hash with :errors key if validation fails
  #
  # @note Amount filters and merchant_group_id are not supported in Typesense search
  def search_typesense(per_page: 25, page: 1)
    errors = check_params
    return { errors: errors } if errors.any?

    results = TypesenseService.search(
      TransactionIndexer::COLLECTION_NAME,
      query: @search_term.presence || '*',
      query_by: 'name,merchant_name,note,merchant_tag_name,plaid_account_name',
      filter_by: build_typesense_filter,
      sort_by: 'date:desc',
      per_page: per_page,
      page: page
    )

    hydrate_typesense_results(results)
  end

  private

  # Converts Typesense search results to hydrated ActiveRecord objects
  #
  # @param results [Hash] Typesense search response
  # @return [Array<PlaidTransaction>] Array of transactions preserving search order
  def hydrate_typesense_results(results)
    ids = results['hits']&.map { |hit| hit['document']['id'].to_i } || []
    
    return [] if ids.empty?

    # Fetch records preserving Typesense result order
    records = PlaidTransaction
      .includes(:plaid_account, :merchant_tag, merchant: [:default_merchant_tag, { merchant_group: [:primary_merchant, :merchants] }])
      .where(id: ids)
      .index_by(&:id)

    ids.map { |id| records[id] }.compact
  end

  # Builds Typesense filter string from configured parameters
  #
  # @return [String] Typesense filter_by string
  def build_typesense_filter
    filters = []
    
    # Always filter by account_id for security
    filters << "account_id:=#{@account_id}"

    if @start_date.present?
      start_timestamp = Date.parse(@start_date.to_s).beginning_of_day.to_i
      filters << "date:>=#{start_timestamp}"
    end

    if @end_date.present?
      end_timestamp = Date.parse(@end_date.to_s).end_of_day.to_i
      filters << "date:<=#{end_timestamp}"
    end

    if @merchant_id.present?
      filters << "merchant_id:=#{@merchant_id}"
    end

    if @transaction_type.present?
      filters << "transaction_type:=#{@transaction_type}"
    end

    if @merchant_tag_id.present?
      tag = MerchantTag.find_by(id: @merchant_tag_id)
      if tag
        child_ids = tag.child_ids
        filters << "merchant_tag_id:=[#{child_ids.join(',')}]"
      end
    end

    if @plaid_account_ids.present? && @plaid_account_ids.is_a?(Array) && @plaid_account_ids.any?
      filters << "plaid_account_id:=[#{@plaid_account_ids.join(',')}]"
    end

    filters.join(' && ')
  end

  # Validates search parameters
  #
  # @return [Array<String>] Array of error messages (empty if valid)
  def check_params
    errors = []
    if @start_date.present? && @end_date.present? && @start_date > @end_date
      errors << "Start date must be before end date"
    end

    if @amount_greater_than.present? && @amount_less_than.present? && @amount_greater_than > @amount_less_than
      errors << "Amount greater than must be less than amount less than"
    end

    if @transaction_type.present? && !PlaidTransaction::TRANSACTION_TYPES.value?(@transaction_type)
      errors << "Invalid transaction type"
    end

    errors
  end
end
