json.array! @aggregated_balances do |balance|
  json.id balance.date.to_s
  json.currentBalance balance.total_balance
  json.createdAt balance.date
end
