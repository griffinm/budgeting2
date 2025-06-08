Typesense.configuration = {
  nodes: [{
    host: 'localhost',
    port: '8108',
    protocol: 'http'
  }],
  api_key: ENV.fetch("TYPESENSE_API_KEY"),
  connection_timeout_seconds: 2
}
