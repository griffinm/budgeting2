namespace :plaid do
  desc "Backfill plaid_transactions.classification_source and reclassify mis-typed income rows (all accounts). Dry run unless invoked as plaid:backfill_classification_source[true]."
  task :backfill_classification_source, [:apply] => :environment do |t, args|
    apply = args[:apply] == 'true'

    # Steps run in runtime-priority order (merchant default > plaid category >
    # user), each scoped to rows no earlier step has claimed.
    unclaimed = -> { PlaidTransaction.where(classification_source: nil) }

    # Step 1: type matches the merchant's own default. Group-fallback defaults
    # are ignored: propagate_defaults_to_group copies defaults onto every group
    # member, so a direct-merchant match is sufficient.
    merchant_default_scope = unclaimed.call.where(
      id: PlaidTransaction.joins(:merchant)
            .where('merchants.default_transaction_type = plaid_transactions.transaction_type')
            .select(:id)
    )

    # Step 2: hardcoded-expense rows that Plaid itself says are income.
    reclassify_scope = unclaimed.call
      .where(transaction_type: 'expense', plaid_category_primary: 'INCOME')
      .where('amount < 0')

    # Step 3: remaining income/transfer rows were deliberately set by someone.
    user_scope = unclaimed.call.where(transaction_type: %w[income transfer])

    merchant_default_count = merchant_default_scope.count
    reclassify_count = reclassify_scope.count

    puts "== Backfill classification_source #{apply ? '(APPLYING)' : '(DRY RUN)'} =="
    puts "Step 1 — stamp 'merchant_default' (type matches merchant default): #{merchant_default_count}"
    puts "Step 2 — reclassify expense -> income (negative amount, Plaid category INCOME): #{reclassify_count}"

    puts "\nStep 2 sample (up to 20 rows):"
    reclassify_scope.order(date: :desc).limit(20).each do |txn|
      puts "  ##{txn.id}  #{txn.date&.to_date}  #{txn.name&.truncate(40)}  #{txn.amount}  #{txn.plaid_category_primary}"
    end

    # Candidate buckets that are reported but never modified.
    transfer_candidates = PlaidTransaction
      .where(transaction_type: 'expense', plaid_category_primary: %w[TRANSFER_IN TRANSFER_OUT])
    refund_candidates = PlaidTransaction
      .where(transaction_type: 'expense')
      .where('amount < 0')
      .where.not(plaid_category_primary: [nil, 'INCOME', 'TRANSFER_IN', 'TRANSFER_OUT'])
    unknown_candidates = PlaidTransaction
      .where(transaction_type: 'expense', plaid_category_primary: nil)
      .where('amount < 0')

    puts "\nUntouched candidate buckets (review manually if needed):"
    puts "  expense rows with TRANSFER_IN/TRANSFER_OUT category (probable transfers): #{transfer_candidates.count}"
    puts "  negative-amount expense rows in spend categories (presumed refunds — correct as-is): #{refund_candidates.count}"
    puts "  negative-amount expense rows with no Plaid category (unknowns): #{unknown_candidates.count}"

    if apply
      ActiveRecord::Base.transaction do
        merchant_default_scope.update_all(classification_source: 'merchant_default')
        reclassify_scope.update_all(transaction_type: 'income', classification_source: 'plaid_category')
        user_count = user_scope.update_all(classification_source: 'user')
        puts "\nStep 3 — stamp 'user' on remaining income/transfer rows: #{user_count}"
      end

      puts "\nDone. classification_source counts:"
      PlaidTransaction.group(:classification_source).count.sort_by { |k, _| k.to_s }.each do |source, count|
        puts "  #{source || '(nil — legacy expense rows)'}: #{count}"
      end
    else
      # Exclude rows step 1 will claim so the dry-run count matches what apply would do
      user_count = user_scope.where.not(id: merchant_default_scope.select(:id)).count
      puts "\nStep 3 — stamp 'user' on remaining income/transfer rows: #{user_count}"
      puts "\nDRY RUN — re-run with plaid:backfill_classification_source[true] to apply"
    end
  end
end
