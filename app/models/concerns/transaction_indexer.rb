module TransactionIndexer
  extend ActiveSupport::Concern

  COLLECTION_NAME = 'transactions'.freeze

  COLLECTION_SCHEMA = {
    name: COLLECTION_NAME,
    fields: [
      { name: 'id', type: 'string' },
      # Access control fields
      { name: 'account_id', type: 'int64', facet: true },
      { name: 'plaid_account_id', type: 'int64', facet: true },
      # Searchable text fields
      { name: 'name', type: 'string' },
      { name: 'merchant_name', type: 'string' },
      { name: 'note', type: 'string', optional: true },
      { name: 'merchant_tag_name', type: 'string', optional: true },
      { name: 'plaid_account_name', type: 'string', optional: true },
      # Numeric fields
      { name: 'amount', type: 'float' },
      # Date field (stored as Unix timestamp for filtering/sorting)
      { name: 'date', type: 'int64' },
      # Filterable fields
      { name: 'merchant_id', type: 'int64', facet: true },
      { name: 'merchant_tag_id', type: 'int64', optional: true, facet: true },
      { name: 'transaction_type', type: 'string', facet: true },
      { name: 'pending', type: 'bool', facet: true }
    ],
    default_sorting_field: 'date'
  }.freeze

  included do
    after_commit :index_to_typesense, on: [:create, :update]
    after_commit :remove_from_typesense, on: :destroy
  end

  # Convert the transaction to a Typesense document format
  def to_typesense_document
    {
      id: id.to_s,
      account_id: account_id,
      plaid_account_id: plaid_account_id,
      name: name || '',
      merchant_name: merchant&.merchant_name || '',
      note: note || '',
      merchant_tag_name: merchant_tag&.name || '',
      plaid_account_name: plaid_account&.nickname || plaid_account&.plaid_name || '',
      amount: amount.to_f,
      date: date.to_i,
      merchant_id: merchant_id,
      merchant_tag_id: merchant_tag_id,
      transaction_type: transaction_type || '',
      pending: pending || false
    }
  end

  def index_to_typesense
    TypesenseService.upsert_document(COLLECTION_NAME, to_typesense_document)
  rescue StandardError => e
    Rails.logger.error "Failed to index transaction #{id} to Typesense: #{e.message}"
  end

  def remove_from_typesense
    TypesenseService.delete_document(COLLECTION_NAME, id.to_s)
  rescue StandardError => e
    Rails.logger.error "Failed to remove transaction #{id} from Typesense: #{e.message}"
  end

  class_methods do
    def typesense_collection_name
      COLLECTION_NAME
    end

    def typesense_schema
      COLLECTION_SCHEMA
    end

    def create_typesense_collection
      TypesenseService.create_collection(COLLECTION_SCHEMA)
    end

    def delete_typesense_collection
      TypesenseService.delete_collection(COLLECTION_NAME)
    end

    def purge_and_rebuild_index(batch_size: 1000, &progress_block)
      # Delete all existing documents
      TypesenseService.delete_all_documents(COLLECTION_NAME)

      total_count = count
      indexed_count = 0

      # Reindex all transactions in batches
      includes(:merchant, :merchant_tag, :plaid_account).find_in_batches(batch_size: batch_size) do |batch|
        documents = batch.map(&:to_typesense_document)
        TypesenseService.import_documents(COLLECTION_NAME, documents)
        
        indexed_count += batch.size
        progress_block&.call(indexed_count, total_count)
      end

      indexed_count
    end

    def reindex_all(batch_size: 1000, &progress_block)
      total_count = count
      indexed_count = 0

      includes(:merchant, :merchant_tag, :plaid_account).find_in_batches(batch_size: batch_size) do |batch|
        documents = batch.map(&:to_typesense_document)
        TypesenseService.import_documents(COLLECTION_NAME, documents)
        
        indexed_count += batch.size
        progress_block&.call(indexed_count, total_count)
      end

      indexed_count
    end
  end
end

