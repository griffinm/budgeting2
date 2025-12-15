class TypesenseService
  class << self
    def client
      @client ||= Typesense::Client.new(Typesense.configuration)
    end

    # Collection management
    def create_collection(schema)
      client.collections.create(schema)
    rescue Typesense::Error::ObjectAlreadyExists
      Rails.logger.info "Collection '#{schema[:name]}' already exists"
      nil
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error creating collection: #{e.message}"
      raise e
    end

    def delete_collection(collection_name)
      client.collections[collection_name].delete
    rescue Typesense::Error::ObjectNotFound
      Rails.logger.info "Collection '#{collection_name}' not found"
      nil
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error deleting collection: #{e.message}"
      raise e
    end

    def collection_exists?(collection_name)
      client.collections[collection_name].retrieve
      true
    rescue Typesense::Error::ObjectNotFound
      false
    end

    def get_collection(collection_name)
      client.collections[collection_name].retrieve
    rescue Typesense::Error::ObjectNotFound
      nil
    end

    # Document operations
    def add_document(collection_name, document)
      client.collections[collection_name].documents.create(document)
    rescue Typesense::Error::ObjectAlreadyExists
      # Document exists, update instead
      update_document(collection_name, document[:id], document)
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error adding document: #{e.message}"
      nil
    end

    def upsert_document(collection_name, document)
      client.collections[collection_name].documents.upsert(document)
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error upserting document: #{e.message}"
      nil
    end

    def update_document(collection_name, document_id, document)
      client.collections[collection_name].documents[document_id.to_s].update(document)
    rescue Typesense::Error::ObjectNotFound
      # Document doesn't exist, create instead
      add_document(collection_name, document)
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error updating document: #{e.message}"
      nil
    end

    def delete_document(collection_name, document_id)
      client.collections[collection_name].documents[document_id.to_s].delete
    rescue Typesense::Error::ObjectNotFound
      Rails.logger.info "Document '#{document_id}' not found in '#{collection_name}'"
      nil
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error deleting document: #{e.message}"
      nil
    end

    def get_document(collection_name, document_id)
      client.collections[collection_name].documents[document_id.to_s].retrieve
    rescue Typesense::Error::ObjectNotFound
      nil
    end

    # Bulk operations
    def import_documents(collection_name, documents, action: :upsert)
      return if documents.empty?
      
      client.collections[collection_name].documents.import(
        documents,
        action: action.to_s
      )
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error importing documents: #{e.message}"
      nil
    end

    def delete_all_documents(collection_name)
      client.collections[collection_name].documents.delete(filter_by: 'id:!=0')
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error deleting all documents: #{e.message}"
      nil
    end

    # Search
    def search(collection_name, query:, query_by:, filter_by: nil, sort_by: nil, per_page: 10, page: 1)
      search_params = {
        q: query,
        query_by: query_by,
        per_page: per_page,
        page: page
      }
      search_params[:filter_by] = filter_by if filter_by.present?
      search_params[:sort_by] = sort_by if sort_by.present?

      client.collections[collection_name].documents.search(search_params)
    rescue Typesense::Error => e
      Rails.logger.error "Typesense error searching: #{e.message}"
      { 'hits' => [], 'found' => 0 }
    end

    # Health check
    def healthy?
      client.health.retrieve
      true
    rescue StandardError
      false
    end
  end
end

