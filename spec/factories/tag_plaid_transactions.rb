FactoryBot.define do
  factory :tag_plaid_transaction do
    association :tag
    association :plaid_transaction
    association :user
  end
end
