class Transactions::SyncJob < SidekiqJob
  def perform(*args)
    begin
    accounts = Account.all
      Rails.logger.info "Syncing transactions for #{accounts.count} accounts"
      accounts.each do |account|
        Rails.logger.debug "Syncing transactions for account #{account.id}"
        PlaidService.new(account_id: account.id).sync_transactions
        Rails.logger.debug "Synced transactions for account #{account.id}"
      end
      Rails.logger.info "Synced transactions for #{accounts.count} accounts"
    rescue => e
      Rails.logger.error "Error syncing transactions: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise e
    ensure
      Rails.logger.info "Syncing next job"
      Transactions::SyncJob.perform_in(1.day)
    end
  end
end
