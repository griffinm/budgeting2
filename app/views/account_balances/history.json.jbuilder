json.array! @account_balances do |account_balance|
  json.id account_balance.id
  json.currentBalance account_balance.current_balance
  json.createdAt account_balance.created_at
end
