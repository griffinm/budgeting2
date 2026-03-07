FactoryBot.define do
  factory :tag do
    association :account
    association :user
    sequence(:name) { |n| "Tag #{n}" }
    color { SecureRandom.hex(3) }
  end
end
