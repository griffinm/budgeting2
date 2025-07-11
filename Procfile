api: rails s -p 3000 -b 0.0.0.0
worker: bundle exec sidekiq -q sync_transactions -q queue -c 1
ui: (cd ui && npm run dev)
