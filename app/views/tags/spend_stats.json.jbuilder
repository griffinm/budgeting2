json.array! @data do |row|
  json.month row[:month]
  json.year row[:year]
  json.tagId row[:tag_id]
  json.totalAmount row[:total_amount]
end
