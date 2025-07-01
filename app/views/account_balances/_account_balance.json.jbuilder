json.id account_balance[:plaid_account_id]
json.currentBalance account_balance[:current_balance]
json.availableBalance account_balance[:available_balance]
json.limit account_balance[:limit]
json.plaidAccount do
  json.partial! 'plaid_account/plaid_account', plaid_account: @accounts.find { |a| a.id == account_balance[:plaid_account_id] }
end 