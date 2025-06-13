json.array! @transactions do |transaction|
  json.partial! "transactions/transaction", transaction: transaction
end