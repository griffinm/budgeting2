# Ensure Typesense collections exist on Rails startup
# This runs after typesense.rb initializer

Rails.application.config.after_initialize do
  # Skip during rake tasks like db:migrate, assets:precompile
  next if defined?(Rails::Console) || File.basename($0) == 'rake'
  
  # Only run in server context
  next unless defined?(Rails::Server) || ENV['TYPESENSE_INIT_COLLECTIONS'] == 'true'

  begin
    # Check if Typesense is healthy before attempting to create collections
    if TypesenseService.healthy?
      Rails.logger.info 'Typesense is healthy, ensuring collections exist...'
      
      # Create transactions collection if it doesn't exist
      unless TypesenseService.collection_exists?(TransactionIndexer::COLLECTION_NAME)
        TypesenseService.create_collection(TransactionIndexer::COLLECTION_SCHEMA)
        Rails.logger.info "Created Typesense collection: #{TransactionIndexer::COLLECTION_NAME}"
      else
        Rails.logger.info "Typesense collection already exists: #{TransactionIndexer::COLLECTION_NAME}"
      end
    else
      Rails.logger.warn 'Typesense is not healthy, skipping collection initialization'
    end
  rescue StandardError => e
    Rails.logger.error "Failed to initialize Typesense collections: #{e.message}"
  end
end

