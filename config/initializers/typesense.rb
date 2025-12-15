# Typesense configuration
Typesense.configuration = {
  nodes: [{
    host: ENV['TYPESENSE_HOST'] || 'localhost',
    port: ENV['TYPESENSE_PORT'] || '8108',
    protocol: ENV['TYPESENSE_PROTOCOL'] || 'http'
  }],
  api_key: ENV['TYPESENSE_API_KEY'],
  connection_timeout_seconds: 2,
  log_level: :info
}
