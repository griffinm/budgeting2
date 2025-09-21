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
