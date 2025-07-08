FactoryBot.define do
  factory :plaid_account do
    association :account
    association :plaid_access_token
    plaid_id { "plaid_account_#{SecureRandom.hex(8)}" }
    plaid_mask { "1234" }
    plaid_name { "Test Account" }
    plaid_official_name { "Test Official Account Name" }
    plaid_type { "depository" }
    plaid_subtype { "checking" }
    plaid_institution_id { "ins_#{SecureRandom.hex(6)}" }
    nickname { "My Test Account" }
  end
end 
