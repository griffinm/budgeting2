FactoryBot.define do
  factory :recurring_stream do
    association :account
    association :merchant
    source { "heuristic" }
    status { "suggested" }
    frequency { "monthly" }
    average_amount { 15.99 }
    amount_signature { format("%.2f", average_amount) }
    last_amount { average_amount }
    first_date { 5.months.ago.to_date }
    last_date { 1.week.ago.to_date }
    predicted_next_date { last_date + 30.days }
    occurrence_count { 5 }
    confidence { 0.9 }
    active { true }

    trait :confirmed do
      status { "confirmed" }
    end

    trait :dismissed do
      status { "dismissed" }
    end
  end
end
