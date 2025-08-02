json.array! @data do |tag|
  json.month tag[:month]
  json.year tag[:year]
  json.tagId tag[:tag_id]
  json.totalAmount tag[:total_amount]
end