task sync_transactions: :environment do
  Rails.logger.info "PlaidSync: Syncing transactions"

  accounts = Account.all
  Rails.logger.info "PlaidSync: Found #{accounts.count} accounts"
  accounts.each do |account|
    Rails.logger.info "PlaidSync: Syncing transactions for account #{account.id}"
    PlaidService.new(account_id: account.id).sync_transactions
    Rails.logger.info "PlaidSync: Synced transactions for account #{account.id}"
  end
end