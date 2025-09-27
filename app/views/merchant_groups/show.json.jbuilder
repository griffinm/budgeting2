json.id @merchant_group.id
json.name @merchant_group.name
json.description @merchant_group.description
json.createdAt @merchant_group.created_at
json.updatedAt @merchant_group.updated_at

json.primaryMerchant do
  json.id @merchant_group.primary_merchant.id
  json.name @merchant_group.primary_merchant.merchant_name
  json.customName @merchant_group.primary_merchant.custom_name
end

json.merchants @merchant_group.merchants do |merchant|
  json.id merchant.id
  json.name merchant.merchant_name
  json.customName merchant.custom_name
  json.isPrimary merchant.id == @merchant_group.primary_merchant_id
end
