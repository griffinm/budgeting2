FactoryBot.define do
  factory :account_balance do
    association :plaid_account
    current_balance { 1000.00 }
    available_balance { 950.00 }
    limit { nil }
  end

  trait :credit_card do
    limit { 5000.00 }
  end

  trait :zero_balance do
    current_balance { 0.00 }
    available_balance { 0.00 }
  end
end 