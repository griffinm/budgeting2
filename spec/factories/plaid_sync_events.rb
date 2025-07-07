FactoryBot.define do
  factory :plaid_sync_event do
    association :account
    association :plaid_access_token
    event_type { "STARTED" }
    started_at { Time.current }
    completed_at { nil }
    cursor { nil }
  end

  trait :completed do
    event_type { "COMPLETED" }
    completed_at { Time.current }
  end

  trait :error do
    event_type { "ERROR" }
    completed_at { Time.current }
  end
end 