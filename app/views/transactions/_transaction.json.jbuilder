json.id transaction.id
json.name transaction.name
json.accountId transaction.account_id
json.authorizedAt transaction.authorized_at
json.date transaction.date
json.amount transaction.amount
json.pending transaction.pending
json.plaidCategoryPrimary transaction.plaid_category_primary
json.plaidCategoryDetail transaction.plaid_category_detail
json.paymentChannel transaction.payment_channel
json.transactionType transaction.transaction_type
json.checkNumber transaction.check_number
json.currencyCode transaction.currency_code

json.merchant do
  json.partial! "merchants/merchant", merchant: transaction.merchant
end

json.plaidAccount do
  json.partial! "plaid_account/plaid_account", plaid_account: transaction.plaid_account
end
