class TypesenseTransactionSearchService
  COLLECTION_NAME = TransactionIndexer::COLLECTION_NAME

  def initialize(
    account_id:,
    query: '*',
    start_date: nil,
    end_date: nil,
    merchant_id: nil,
    transaction_type: nil,
    merchant_tag_id: nil,
    plaid_account_ids: nil,
    pending: nil,
    per_page: 25,
    page: 1
  )
    @account_id = account_id
    @query = query.presence || '*'
    @start_date = start_date
    @end_date = end_date
    @merchant_id = merchant_id
    @transaction_type = transaction_type
    @merchant_tag_id = merchant_tag_id
    @plaid_account_ids = plaid_account_ids
    @pending = pending
    @per_page = per_page
    @page = page
  end

  def call
    results = TypesenseService.search(
      COLLECTION_NAME,
      query: @query,
      query_by: 'name,merchant_name,note,merchant_tag_name,plaid_account_name',
      filter_by: build_filter,
      sort_by: 'date:desc',
      per_page: @per_page,
      page: @page
    )

    {
      hits: results['hits']&.map { |hit| hit['document'] } || [],
      found: results['found'] || 0,
      page: @page,
      per_page: @per_page,
      total_pages: ((results['found'] || 0).to_f / @per_page).ceil
    }
  end

  # Returns the PlaidTransaction ActiveRecord objects for the search results
  def call_with_records
    results = call
    
    return { records: [], meta: results.except(:hits) } if results[:hits].empty?
    
    ids = results[:hits].map { |doc| doc['id'].to_i }
    
    # Fetch records in the same order as search results
    records = PlaidTransaction
      .includes(:merchant, :merchant_tag, :plaid_account)
      .where(id: ids)
      .index_by(&:id)
    
    ordered_records = ids.map { |id| records[id] }.compact
    
    {
      records: ordered_records,
      meta: results.except(:hits)
    }
  end

  private

  def build_filter
    filters = []
    
    # Always filter by account_id for security
    filters << "account_id:=#{@account_id}"

    # Date range filtering
    if @start_date.present?
      start_timestamp = parse_date(@start_date).beginning_of_day.to_i
      filters << "date:>=#{start_timestamp}"
    end

    if @end_date.present?
      end_timestamp = parse_date(@end_date).end_of_day.to_i
      filters << "date:<=#{end_timestamp}"
    end

    # Merchant filtering
    if @merchant_id.present?
      filters << "merchant_id:=#{@merchant_id}"
    end

    # Transaction type filtering
    if @transaction_type.present?
      filters << "transaction_type:=#{@transaction_type}"
    end

    # Merchant tag filtering
    if @merchant_tag_id.present?
      # Get child tag IDs for hierarchical filtering
      tag = MerchantTag.find_by(id: @merchant_tag_id)
      if tag
        child_ids = tag.child_ids
        filters << "merchant_tag_id:=[#{child_ids.join(',')}]"
      end
    end

    # Plaid account filtering
    if @plaid_account_ids.present? && @plaid_account_ids.is_a?(Array) && @plaid_account_ids.any?
      filters << "plaid_account_id:=[#{@plaid_account_ids.join(',')}]"
    end

    # Pending filtering
    if @pending.present?
      pending_value = @pending.to_s == 'true'
      filters << "pending:=#{pending_value}"
    end

    filters.join(' && ')
  end

  def parse_date(date_value)
    case date_value
    when Date, Time, DateTime
      date_value.to_date
    when String
      Date.parse(date_value)
    else
      date_value
    end
  end
end

