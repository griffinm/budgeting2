namespace :merchant_tags do
  desc "Type existing 'Income' category trees as income and align their transactions (all accounts). Dry run unless invoked as merchant_tags:backfill_tag_types[true]."
  task :backfill_tag_types, [:apply] => :environment do |t, args|
    apply = args[:apply] == 'true'

    puts "== Backfill tag types #{apply ? '(APPLYING)' : '(DRY RUN)'} =="

    # Step 1: income trees — roots named exactly 'Income', plus all descendants
    income_tag_ids = []
    Account.find_each do |account|
      roots = account.merchant_tags.where(parent_merchant_tag_id: nil, name: 'Income')
      next if roots.empty?

      tree_ids = roots.flat_map(&:child_ids) # child_ids includes self
      income_tag_ids.concat(tree_ids)
      puts "Account ##{account.id}: #{roots.count} Income root(s), #{tree_ids.count} tags to type as income"
    end

    already_income = MerchantTag.where(id: income_tag_ids, tag_type: 'income').count
    puts "Step 1 — tags to type as income: #{income_tag_ids.count} (#{already_income} already income)"

    # Report A: rows under income tags whose type disagrees
    mismatched = PlaidTransaction
      .where(merchant_tag_id: income_tag_ids)
      .where.not(transaction_type: 'income')
    fixable = mismatched.where.not(classification_source: 'user')
    user_classified = mismatched.where(classification_source: 'user')

    puts "\nReport A — transactions under income tags not typed income:"
    puts "  fixable (not user-classified): #{fixable.count}"
    fixable.order(date: :desc).limit(20).each do |txn|
      puts "    ##{txn.id}  #{txn.date&.to_date}  #{txn.name&.truncate(40)}  #{txn.amount}  #{txn.transaction_type}  #{txn.classification_source || '(nil)'}"
    end
    puts "  user-classified — review manually, never touched: #{user_classified.count}"
    user_classified.order(date: :desc).limit(20).each do |txn|
      puts "    ##{txn.id}  #{txn.date&.to_date}  #{txn.name&.truncate(40)}  #{txn.amount}  #{txn.transaction_type}"
    end

    # Report B (informational, never modified): income rows under expense tags
    misplaced_income = PlaidTransaction
      .joins(:merchant_tag)
      .where(merchant_tags: { tag_type: 'expense' })
      .where.not(merchant_tag_id: income_tag_ids)
      .where(transaction_type: 'income')
    puts "\nReport B — income-typed transactions under expense categories (informational): #{misplaced_income.count}"
    misplaced_income.order(date: :desc).limit(20).each do |txn|
      puts "    ##{txn.id}  #{txn.date&.to_date}  #{txn.name&.truncate(40)}  #{txn.amount}  tag: #{txn.merchant_tag&.name}"
    end

    if apply
      ActiveRecord::Base.transaction do
        # Bypasses model callbacks/audits on purpose: child_ids already covers
        # each full subtree, so the cascade would be redundant.
        MerchantTag.where(id: income_tag_ids).update_all(tag_type: 'income', updated_at: Time.current)
        fixed = fixable.update_all(transaction_type: 'income', classification_source: 'category_default')
        puts "\nApplied: #{income_tag_ids.count} tags typed income, #{fixed} transactions reclassified"
      end

      puts "\nDone. tag_type counts: #{MerchantTag.group(:tag_type).count.inspect}"
      remaining = PlaidTransaction.where(merchant_tag_id: income_tag_ids).where.not(transaction_type: 'income').count
      puts "Remaining mismatched rows under income tags (user-classified): #{remaining}"
    else
      puts "\nDRY RUN — re-run with merchant_tags:backfill_tag_types[true] to apply"
    end
  end
end
