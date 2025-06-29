class SidekiqJob
    include Sidekiq::Job

    sidekiq_options retry: 5
    queue_as :default  
end
