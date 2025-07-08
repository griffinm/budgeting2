class Transactions::SyncForAccountJob < SidekiqJob
  def perform(*args)
    begin
      account_id = args[0]["account_id"]
      service = PlaidService.new(account_id: account_id)
      service.sync_transactions
      service.update_account_balances
    rescue => e
      Rails.logger.error "Error syncing transactions for account #{account_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise e
    end
    Rails.logger.info "Synced transactions for account #{account_id}"
  end
end
