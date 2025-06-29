redis_url = ENV.fetch("REDIS_URL")

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end

# Schedule the sync job after Rails is fully initialized
Rails.application.config.after_initialize do
  # Check if we already scheduled a job today
  today = Date.current
  last_scheduled = Rails.cache.fetch("transactions_sync_job_last_scheduled")
  
  if last_scheduled.nil? || last_scheduled.to_date < today
    Rails.logger.info "Scheduling Transactions::SyncJob for #{today}"
    job_time = Date.current.tomorrow.beginning_of_day.in_time_zone('Eastern Time (US & Canada)')
    Transactions::SyncJob.perform_at(job_time)
    
    # Store the date we scheduled the job
    Rails.cache.write("transactions_sync_job_last_scheduled", today, expires_in: 2.days)
  else
    Rails.logger.info "Transactions::SyncJob already scheduled for today (#{today})"
  end
end
