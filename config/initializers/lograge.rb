Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::KeyValue.new
  config.lograge.base_controller_class = 'ActionController::API'
  
  # Exclude health endpoint from request logging
  config.lograge.ignore_actions = ['health#index']
end
