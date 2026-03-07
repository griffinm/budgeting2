class SyncService < BaseService

  def self.sync_transactions
    accounts = Account.live_accounts
    Rails.logger.info "Syncing transactions for #{accounts.count} live accounts"
    accounts.each do |account|
      plaid_service = PlaidService.new(account_id: account.id)
      plaid_service.sync_transactions
      plaid_service.sync_balances
    end
    Rails.logger.info "Synced transactions for #{accounts.count} live accounts"
  end

end
