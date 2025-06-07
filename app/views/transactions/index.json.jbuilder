json.transactions @transactions do |transaction|
  transaction.to_builder.target!
end
json.partial! "page/page", page: @page

