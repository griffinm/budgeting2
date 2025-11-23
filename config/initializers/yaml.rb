# Allow BigDecimal and other common classes in YAML serialization
# This is required for the audited gem and other YAML-based serialization
Rails.application.config.active_record.yaml_column_permitted_classes ||= []
Rails.application.config.active_record.yaml_column_permitted_classes.concat([
  BigDecimal,
  Date,
  Time,
  ActiveSupport::TimeWithZone,
  ActiveSupport::TimeZone,
  Symbol
])

