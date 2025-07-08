require 'rails_helper'

RSpec.describe RedisService do
  let(:user) { create(:user) }
  let(:mock_redis) { instance_double(Redis) }

  before do
    allow(Redis).to receive(:new).and_return(mock_redis)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("REDIS_URL").and_return("redis://localhost:6379/0")
  end

  describe '#initialize' do
    it 'sets the user instance variable' do
      service = described_class.new(user: user)
      expect(service.instance_variable_get(:@user)).to eq(user)
    end
  end

  describe 'private #get_last_sync_time' do
    it 'fetches the last_sync_time from Redis using the correct key' do
      service = described_class.new(user: user)
      last_sync_key = "budgeting:user:#{user.id}:last_sync_time"
      expect(mock_redis).to receive(:get).with(last_sync_key).and_return('2024-01-01T00:00:00Z')
      expect(service.send(:get_last_sync_time)).to eq('2024-01-01T00:00:00Z')
    end
  end

  describe 'private #set_last_sync_time' do
    it 'sets the last_sync_time in Redis using the correct key and value' do
      service = described_class.new(user: user)
      last_sync_key = "budgeting:user:#{user.id}:last_sync_time"
      expect(mock_redis).to receive(:set).with(last_sync_key, '2024-01-01T00:00:00Z').and_return('OK')
      expect(service.send(:set_last_sync_time, '2024-01-01T00:00:00Z')).to eq('OK')
    end
  end

  describe '#get_is_updating_transactions?' do
    it 'fetches the is_updating value from Redis using the correct key' do
      service = described_class.new(user: user)
      is_updating_key = "budgeting:user:#{user.id}:is_updating"
      expect(mock_redis).to receive(:get).with(is_updating_key).and_return('true')
      expect(service.get_is_updating_transactions?).to eq(true)
    end
  end

  describe '#set_is_updating_transactions' do
    it 'sets the is_updating value in Redis using the correct key and value' do
      service = described_class.new(user: user)
      is_updating_key = "budgeting:user:#{user.id}:is_updating"
      expect(mock_redis).to receive(:set).with(is_updating_key, 'true').and_return('OK')
      expect(service.set_is_updating_transactions('true')).to eq('OK')
    end
  end

  # More tests will be added for get_last_sync_time, set_last_sync_time
end 
