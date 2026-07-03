FactoryBot.define do
  factory :merchant_tag do
    association :account
    association :user
    sequence(:name) { |n| "Merchant Tag #{n}" }

    trait :with_budget do
      target_budget { 100.00 }
    end

    trait :income do
      tag_type { 'income' }
    end
  end
end
