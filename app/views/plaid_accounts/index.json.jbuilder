json.array! @plaid_accounts do |plaid_account|
  json.partial! "plaid_accounts/plaid_account", plaid_account: plaid_account
end
