json.array! @merchant_groups do |group|
  json.id group.id
  json.name group.name
  json.description group.description
  json.createdAt group.created_at
  json.updatedAt group.updated_at
  
  json.primaryMerchant do
    json.id group.primary_merchant.id
    json.name group.primary_merchant.merchant_name
    json.customName group.primary_merchant.custom_name
  end
  
  json.merchantCount group.merchants.count
  
  json.merchants group.merchants do |merchant|
    json.id merchant.id
    json.name merchant.merchant_name
    json.customName merchant.custom_name
  end
end
