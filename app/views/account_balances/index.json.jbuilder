json.array! @account_balances do |account_balance|
  json.partial! 'account_balances/account_balance', account_balance: account_balance
end