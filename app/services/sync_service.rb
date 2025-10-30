class SyncService < BaseService

  def self.sync_transactions
    accounts = Account.live_accounts
    Rails.logger.info "Syncing transactions for #{accounts.count} live accounts"
    accounts.each do |account|
      PlaidService.new(account_id: account.id).sync_transactions
    end
    Rails.logger.info "Synced transactions for #{accounts.count} live accounts"
  end

end
