json.items @merchants do |merchant|
  json.partial! "merchant", merchant: merchant
end
json.partial! "page/page", page: @page