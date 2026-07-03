json.partial! 'transactions/transaction', transaction: @transaction

# One level only: the partial itself never renders relations, so no recursion.
if @transaction.split
  json.childTransactions @transaction.child_transactions.order(:id) do |child|
    json.partial! 'transactions/transaction', transaction: child
  end
end

if @transaction.parent_plaid_transaction_id
  json.parentTransaction do
    json.partial! 'transactions/transaction', transaction: @transaction.parent_transaction
  end
end
