class RedisService < BaseService
  REDIS_KEY_PREFIX = "budgeting".freeze
  USER_KEY_PREFIX = "user".freeze
  TRANSACTION_UPDATE_KEY = "last_sync_time".freeze
  IS_UPDATING_KEY = "is_updating".freeze
  @client = nil
  @user = nil

  def initialize(user:)
    @user = user
  end

  def get_is_updating_transactions?
    client.get(keys[:is_updating]) == "true"
  end

  def set_is_updating_transactions(value)
    client.set(keys[:is_updating], value) 
  end

  def get_last_sync_time
    client.get(keys[:last_sync_time])
  end

  def set_last_sync_time(time)
    client.set(keys[:last_sync_time], time)
  end

  private def client
    @client ||= Redis.new(url: ENV["REDIS_URL"])
  end

  private def keys
    full_user_prefix = "#{REDIS_KEY_PREFIX}:#{USER_KEY_PREFIX}:#{@user.id}"
    {
      user_key: full_user_prefix,
      last_sync_time: "#{full_user_prefix}:#{TRANSACTION_UPDATE_KEY}",
      is_updating: "#{full_user_prefix}:#{IS_UPDATING_KEY}"
    }
  end
end
