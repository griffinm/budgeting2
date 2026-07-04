json.items @recurring_streams do |recurring_stream|
  json.partial! "recurring_stream", recurring_stream: recurring_stream
end
json.partial! "page/page", page: @page
