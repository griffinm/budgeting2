FactoryBot.define do
  factory :plaid_accounts_user do
    association :plaid_account
    association :user
  end
end
