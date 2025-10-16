require_relative "boot"

require "rails/rack"
require "active_record/railtie"
require "action_controller/railtie" 
#require "action_view/railtie"
#require "action_mailer/railtie"
require "active_job/railtie"
# require "action_cable/engine"
#require "action_mailbox/engine"
#require "action_text/engine"
#require "rails/test_unit/railtie"

require_relative "../app/middleware/camel_to_snake_middleware"

Bundler.require(*Rails.groups)

module Budgeting2
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    
    # Don't require master key for production (use env vars instead)
    config.require_master_key = false

    config.time_zone = "UTC"
    config.api_only = true
    
    config.active_record.yaml_column_permitted_classes = [Symbol, Date, Time, ActiveSupport::TimeWithZone, ActiveSupport::TimeZone]

    config.middleware.use CamelToSnakeMiddleware

    # This also configures session_options for use below
    config.session_store :cookie_store, key: "_your_app_session"

    # Required for all session management (regardless of session_store)
    config.middleware.use ActionDispatch::Cookies

    config.middleware.use config.session_store, config.session_options


  end
end
