namespace :recurring do
  desc "Run heuristic recurring-stream detection (optionally for one account)"
  task :detect, [:account_id] => :environment do |_t, args|
    accounts = args[:account_id] ? Account.where(id: args[:account_id]) : Account.all
    Rails.logger.info "RecurringDetection: Detecting for #{accounts.count} accounts"

    accounts.find_each do |account|
      result = RecurringDetectionService.new(account_id: account.id).call
      Rails.logger.info "RecurringDetection: account #{account.id} -> #{result.inspect}"
      puts "Account #{account.id}: #{result.inspect}"
    end
  end
end
