FactoryBot.define do
  factory :plaid_access_token do
    association :account
    token { "access-sandbox-#{SecureRandom.hex(10)}" }
    next_cursor { nil }
  end
end 