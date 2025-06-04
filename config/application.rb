require_relative "boot"

require "rails/rack"
require "active_record/railtie"
require "action_controller/railtie" 
#require "action_view/railtie"
#require "action_mailer/railtie"
#require "active_job/railtie"
#require "action_cable/engine"
#require "action_mailbox/engine"
#require "action_text/engine"
#require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module Budgeting2
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])

    config.time_zone = "Central Time (US & Canada)"
    config.api_only = true
  end
end
