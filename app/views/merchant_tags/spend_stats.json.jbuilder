json.array! @all_tags do |tag|
  json.partial! 'merchant_tags/merchant_tag', merchant_tag: tag
  json.totalTransactionAmount @data.find { |t| t[:id] == tag[:id] }[:total_transaction_amount] || 0
end
