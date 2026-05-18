# Rake wrappers around PlaidDuplicateItemMerger — see that service for the full
# explanation of what a "duplicate Item" is and how the merge works.
#
# Usage (dry run — prints a report, changes nothing):
#
#   bundle exec rake plaid:cleanup_duplicate_item \
#     OLD_ACCESS_TOKEN_ID=12 NEW_ACCESS_TOKEN_ID=34
#
# Apply for real:
#
#   bundle exec rake plaid:cleanup_duplicate_item \
#     OLD_ACCESS_TOKEN_ID=12 NEW_ACCESS_TOKEN_ID=34 DRY_RUN=false
#
# To discover the access token IDs first:
#
#   bundle exec rake plaid:list_items
#
# Optional env vars:
#   DATE_TOLERANCE  days of slack when matching transaction dates (default 3)
#   REMOVE_ITEM     call Plaid /item/remove on the old Item (default true)

namespace :plaid do
  desc "List Plaid Items (access tokens) with their accounts and connection status"
  task list_items: :environment do
    PlaidAccessToken.includes(:plaid_accounts).order(:account_id, :id).each do |token|
      err = token.error_code ? " (#{token.error_code})" : ""
      puts "AccessToken ##{token.id}  account=#{token.account_id}  item=#{token.item_id}  status=#{token.status}#{err}"
      token.plaid_accounts.with_deleted.order(:id).each do |pa|
        deleted = pa.deleted_at ? " [deleted #{pa.deleted_at}]" : ""
        puts "    PlaidAccount ##{pa.id}  #{pa.plaid_official_name.inspect}  mask=#{pa.plaid_mask}  " \
             "subtype=#{pa.plaid_subtype}  txns=#{pa.plaid_transactions.count}#{deleted}"
      end
      puts
    end
  end

  desc "Merge a re-added duplicate Plaid Item into the original one"
  task cleanup_duplicate_item: :environment do
    dry_run     = ENV.fetch("DRY_RUN", "true") != "false"
    tolerance   = Integer(ENV.fetch("DATE_TOLERANCE", "3"))
    remove_item = ENV.fetch("REMOVE_ITEM", "true") != "false"

    old_token = PlaidAccessToken.find(Integer(ENV.fetch("OLD_ACCESS_TOKEN_ID")))
    new_token = PlaidAccessToken.find(Integer(ENV.fetch("NEW_ACCESS_TOKEN_ID")))

    merger = PlaidDuplicateItemMerger.new(
      old_token: old_token,
      new_token: new_token,
      date_tolerance: tolerance
    )

    begin
      plan = merger.plan
    rescue PlaidDuplicateItemMerger::Error => e
      abort "ERROR: #{e.message}"
    end

    banner = dry_run ? "DRY RUN — no changes will be written" : "APPLYING CHANGES"
    puts "=" * 72
    puts "Plaid duplicate Item cleanup  (#{banner})"
    puts "  OLD Item: AccessToken ##{old_token.id}  status=#{old_token.status}"
    puts "  NEW Item: AccessToken ##{new_token.id}  status=#{new_token.status}"
    puts "  Date tolerance: #{tolerance} day(s)"
    puts "=" * 72

    if plan.pairs.empty?
      abort "ERROR: no account pairs matched between the two Items — nothing to merge."
    end

    if plan.unmatched_new_accounts.any?
      puts "\nWARNING: #{plan.unmatched_new_accounts.size} new account(s) had no old counterpart " \
           "and will be LEFT AS-IS:"
      plan.unmatched_new_accounts.each do |a|
        puts "  - PlaidAccount ##{a.id} #{a.plaid_official_name.inspect} mask=#{a.plaid_mask}"
      end
    end

    plan.pairs.each do |pair|
      puts "\nPair: old PlaidAccount ##{pair.old_account.id} <- new PlaidAccount ##{pair.new_account.id}  " \
           "(#{pair.old_account.plaid_official_name})"
      puts "  duplicate new txns to DELETE:        #{pair.duplicate_ids.size}"
      puts "  unique new txns to RE-POINT to old:  #{pair.repoint_ids.size}"
    end

    puts "\n" + "-" * 72
    puts "Summary: delete #{plan.duplicate_count} duplicate txns, re-point #{plan.repoint_count} txns,"
    puts "         merge #{plan.pairs.size} account(s), retire old Item ##{old_token.id}."
    puts "-" * 72

    if dry_run
      puts "\nDRY RUN complete. Re-run with DRY_RUN=false to apply."
      next
    end

    begin
      merger.apply!(remove_item: remove_item)
    rescue PlaidDuplicateItemMerger::Error => e
      abort "ERROR while applying: #{e.message}"
    end

    puts "\nDone. Cleanup applied successfully."
  end
end
