class Transactions::SyncForAccountJob < SidekiqJob
  sidekiq_options queue: :sync_transactions

  def perform(*args)
    account_id = args[0]["account_id"]
    user_id = args[0]["user_id"]
    force_update = args[0]["force_update"]
    user = User.find(user_id)
    redis_service = RedisService.new(user: user)

    unless force_update
      if user_id.blank? || account_id.blank?
        Rails.logger.error "User ID or account ID is blank"
        return
      end

      user = User.find(user_id)

      last_sync_time = redis_service.get_last_sync_time
      if redis_service.get_is_updating_transactions?
        return
      end

      if !last_sync_time.blank? && last_sync_time > Constants::TransactionUpdates::FREQUENCY.ago
        return
      end
    end

    redis_service.set_is_updating_transactions(true)
    redis_service.set_last_sync_time(Time.now)

    begin
      account_id = args[0]["account_id"]
      service = PlaidService.new(account_id: account_id)
      service.sync_transactions
    rescue => e
      Rails.logger.error "Error syncing transactions for account #{account_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise e
    ensure
      redis_service.set_is_updating_transactions(false)
    end
    
    Rails.logger.info "Synced transactions for account #{account_id}"
  end
end
