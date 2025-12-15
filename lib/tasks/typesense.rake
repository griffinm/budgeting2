namespace :typesense do
  desc 'Check Typesense health status'
  task health: :environment do
    if TypesenseService.healthy?
      puts '✓ Typesense is healthy'
    else
      puts '✗ Typesense is not reachable'
      exit 1
    end
  end

  desc 'Create all Typesense collections'
  task create_collections: :environment do
    puts 'Creating Typesense collections...'
    
    if TypesenseService.collection_exists?(TransactionIndexer::COLLECTION_NAME)
      puts "  Collection '#{TransactionIndexer::COLLECTION_NAME}' already exists"
    else
      TypesenseService.create_collection(TransactionIndexer::COLLECTION_SCHEMA)
      puts "  ✓ Created collection '#{TransactionIndexer::COLLECTION_NAME}'"
    end
    
    puts 'Done!'
  end

  desc 'Delete all Typesense collections'
  task delete_collections: :environment do
    puts 'Deleting Typesense collections...'
    
    TypesenseService.delete_collection(TransactionIndexer::COLLECTION_NAME)
    puts "  ✓ Deleted collection '#{TransactionIndexer::COLLECTION_NAME}'"
    
    puts 'Done!'
  end

  namespace :transactions do
    desc 'Index all transactions to Typesense'
    task reindex: :environment do
      puts 'Reindexing all transactions to Typesense...'
      
      # Ensure collection exists
      unless TypesenseService.collection_exists?(TransactionIndexer::COLLECTION_NAME)
        TypesenseService.create_collection(TransactionIndexer::COLLECTION_SCHEMA)
        puts "  Created collection '#{TransactionIndexer::COLLECTION_NAME}'"
      end

      total = PlaidTransaction.count
      puts "  Total transactions to index: #{total}"

      start_time = Time.current
      indexed = PlaidTransaction.reindex_all(batch_size: 1000) do |indexed_count, total_count|
        percentage = (indexed_count.to_f / total_count * 100).round(1)
        print "\r  Progress: #{indexed_count}/#{total_count} (#{percentage}%)"
      end
      
      elapsed = Time.current - start_time
      puts "\n  ✓ Indexed #{indexed} transactions in #{elapsed.round(2)}s"
    end

    desc 'Purge and rebuild the transactions index'
    task purge_and_rebuild: :environment do
      puts 'Purging and rebuilding transactions index...'
      
      # Ensure collection exists
      unless TypesenseService.collection_exists?(TransactionIndexer::COLLECTION_NAME)
        TypesenseService.create_collection(TransactionIndexer::COLLECTION_SCHEMA)
        puts "  Created collection '#{TransactionIndexer::COLLECTION_NAME}'"
      end

      total = PlaidTransaction.count
      puts "  Total transactions to index: #{total}"

      start_time = Time.current
      indexed = PlaidTransaction.purge_and_rebuild_index(batch_size: 1000) do |indexed_count, total_count|
        percentage = (indexed_count.to_f / total_count * 100).round(1)
        print "\r  Progress: #{indexed_count}/#{total_count} (#{percentage}%)"
      end
      
      elapsed = Time.current - start_time
      puts "\n  ✓ Purged and rebuilt index with #{indexed} transactions in #{elapsed.round(2)}s"
    end

    desc 'Clear all transactions from Typesense index'
    task clear: :environment do
      puts 'Clearing all transactions from Typesense...'
      
      TypesenseService.delete_all_documents(TransactionIndexer::COLLECTION_NAME)
      puts '  ✓ Cleared all transaction documents'
    end

    desc 'Drop and recreate the transactions collection'
    task recreate: :environment do
      puts 'Recreating transactions collection...'
      
      TypesenseService.delete_collection(TransactionIndexer::COLLECTION_NAME)
      puts "  ✓ Deleted collection '#{TransactionIndexer::COLLECTION_NAME}'"
      
      TypesenseService.create_collection(TransactionIndexer::COLLECTION_SCHEMA)
      puts "  ✓ Created collection '#{TransactionIndexer::COLLECTION_NAME}'"
      
      puts 'Done! Run typesense:transactions:reindex to populate the index.'
    end

    desc 'Show statistics about the transactions index'
    task stats: :environment do
      puts 'Transactions index statistics:'
      
      collection = TypesenseService.get_collection(TransactionIndexer::COLLECTION_NAME)
      
      if collection
        puts "  Collection: #{collection['name']}"
        puts "  Documents: #{collection['num_documents']}"
        puts "  Fields: #{collection['fields'].map { |f| f['name'] }.join(', ')}"
      else
        puts "  Collection '#{TransactionIndexer::COLLECTION_NAME}' does not exist"
      end
      
      db_count = PlaidTransaction.count
      puts "  Database records: #{db_count}"
      
      if collection
        diff = db_count - collection['num_documents']
        if diff != 0
          puts "  ⚠ Difference: #{diff.abs} #{diff > 0 ? 'missing from index' : 'extra in index'}"
        else
          puts "  ✓ Index is in sync with database"
        end
      end
    end
  end
end

