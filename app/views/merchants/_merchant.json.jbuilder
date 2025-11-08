json.id merchant.id
json.name merchant.merchant_name
json.logoUrl merchant.logo_url
json.address merchant.address
json.city merchant.city
json.state merchant.state
json.zip merchant.zip
json.customName merchant.custom_name
json.plaidEntityId merchant.plaid_entity_id
json.website merchant.website
json.defaultTransactionType merchant.default_transaction_type
json.defaultMerchantTagId merchant.default_merchant_tag_id
json.plaidCategoryPrimary merchant.plaid_category_primary
json.plaidCategoryDetail merchant.plaid_category_detail
json.plaidCategoryConfidenceLevel merchant.plaid_category_confidence_level

json.defaultMerchantTag do
  if merchant.default_merchant_tag
    json.partial! 'merchant_tags/merchant_tag', merchant_tag: merchant.default_merchant_tag
  end
end

json.merchantGroup do
  if merchant.merchant_group
    json.id merchant.merchant_group.id
    json.name merchant.merchant_group.name
    json.description merchant.merchant_group.description
    json.createdAt merchant.merchant_group.created_at
    json.updatedAt merchant.merchant_group.updated_at
    
    json.primaryMerchant do
      json.id merchant.merchant_group.primary_merchant.id
      json.name merchant.merchant_group.primary_merchant.merchant_name
      json.customName merchant.merchant_group.primary_merchant.custom_name
    end
    
    json.merchants merchant.merchant_group.merchants do |group_merchant|
      json.id group_merchant.id
      json.name group_merchant.merchant_name
      json.customName group_merchant.custom_name
    end
    
    json.merchantCount merchant.merchant_group.merchants.length
  end
end
