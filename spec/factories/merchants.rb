FactoryBot.define do
  factory :merchant do
    association :account
    merchant_name { "Test Merchant" }
    logo_url { nil }
    address { nil }
    city { nil }
    state { nil }
    zip { nil }
    custom_name { nil }
    plaid_entity_id { nil }
    website { nil }
  end

  trait :with_plaid_entity_id do
    plaid_entity_id { "entity_#{SecureRandom.hex(8)}" }
  end

  trait :with_address do
    address { "123 Test St" }
    city { "Test City" }
    state { "TS" }
    zip { "12345" }
  end
end 