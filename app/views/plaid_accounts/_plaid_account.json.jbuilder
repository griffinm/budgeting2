json.id plaid_account.id
json.accountType plaid_account.account_type
json.plaidOfficialName plaid_account.plaid_official_name
json.plaidType plaid_account.plaid_type
json.plaidSubtype plaid_account.plaid_subtype
json.plaidMask plaid_account.plaid_mask
json.createdAt plaid_account.created_at
json.updatedAt plaid_account.updated_at
json.nickname plaid_account.nickname
json.users plaid_account.users, partial: 'users/user', as: :user
