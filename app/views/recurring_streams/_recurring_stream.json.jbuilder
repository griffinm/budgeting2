json.id recurring_stream.id
json.source recurring_stream.source
json.status recurring_stream.status
json.frequency recurring_stream.frequency
json.averageAmount recurring_stream.average_amount
json.lastAmount recurring_stream.last_amount
json.firstDate recurring_stream.first_date
json.lastDate recurring_stream.last_date
json.predictedNextDate recurring_stream.predicted_next_date
json.occurrenceCount recurring_stream.occurrence_count
json.confidence recurring_stream.confidence
json.active recurring_stream.active
json.createdAt recurring_stream.created_at
json.updatedAt recurring_stream.updated_at

json.merchant do
  json.partial! "merchants/merchant", merchant: recurring_stream.merchant
end
