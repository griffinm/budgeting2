json.array! @merchant_tags do |merchant_tag|
  json.partial! 'merchant_tags/merchant_tag', merchant_tag: merchant_tag
end