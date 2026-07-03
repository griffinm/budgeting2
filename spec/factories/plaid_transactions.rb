FactoryBot.define do
  factory :plaid_transaction do
    association :account
    association :plaid_sync_event
    association :plaid_account
    association :merchant
    plaid_id { "transaction_#{SecureRandom.hex(8)}" }
    # Plaid's raw sign convention: positive = money out (expense), negative = money in
    amount { 50.00 }
    name { "Test Transaction" }
    authorized_at { 1.day.ago }
    date { 1.day.ago.to_date }
    check_number { nil }
    currency_code { "USD" }
    pending { false }
    plaid_category_primary { "FOOD_AND_DRINK" }
    plaid_category_detail { "RESTAURANTS" }
    payment_channel { "online" }
    transaction_type { "expense" }
    note { nil }
  end

  trait :income do
    amount { -1000.00 }
    transaction_type { "income" }
    plaid_category_primary { "INCOME" }
    plaid_category_detail { "INCOME_WAGES" }
  end

  trait :transfer do
    amount { 500.00 }
    transaction_type { "transfer" }
    plaid_category_primary { "TRANSFER_OUT" }
    plaid_category_detail { "TRANSFER_OUT_ACCOUNT_TRANSFER" }
  end

  trait :pending do
    pending { true }
  end

  trait :with_check_number do
    check_number { "1234" }
  end

  trait :split_parent do
    split { true }

    after(:create) do |parent|
      [30.00, 20.00].each do |child_amount|
        create(:plaid_transaction, :split_child, parent: parent, amount: child_amount)
      end
    end
  end

  trait :split_child do
    transient do
      parent { nil }
    end

    parent_transaction { parent }
    account { parent&.account }
    plaid_sync_event { parent&.plaid_sync_event }
    plaid_account { parent&.plaid_account }
    merchant { parent&.merchant }
    date { parent&.date }
    plaid_id { "split:#{parent&.id}:#{SecureRandom.hex(8)}" }
  end
end 