class TypesenseClient
  def initialize()
    @client = Typesense::Client.new(api_key: ENV.fetch("TYPESENSE_API_KEY"))
  end

  def create_collection(schema)
    @client.collections.create(schema)
  end

  def delete_collection(name)
    @client.collections(name).delete
  end

  def search(collection, query)
    @client.collections(collection).documents.search(query)
  end
end
