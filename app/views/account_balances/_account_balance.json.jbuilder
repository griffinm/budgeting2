json.id account_balance.plaid_account.id
json.currentBalance account_balance.current_balance
json.availableBalance account_balance.available_balance
json.limit account_balance.limit
json.createdAt account_balance.created_at
json.plaidAccount do
  json.partial! 'plaid_account/plaid_account', plaid_account: account_balance.plaid_account
end 
