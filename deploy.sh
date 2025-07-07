#!/bin/bash

set -e

# Check if the correct number of arguments are provided
if [ $# -ne 1 ]; then
    echo "⚠Usage: $0 <server_ip>"
    exit 1
fi
# Pre-deploy checks
echo "🔄 Installing local dependencies"
if ! bundle install; then
    echo "❌ Failed to install local dependencies"
    exit 1
fi
echo "✅ Installed local dependencies"

echo "🔄 Installing local node dependencies"
if ! cd ui && npm install; then
    echo "❌ Failed to install local node dependencies"
    exit 1
fi
echo "✅ Installed local node dependencies"

echo "🔄 Running rspec tests"
if ! bundle exec rspec; then
    echo "❌ Rspec tests failed"
    exit 1
fi
echo "✅ Rspec tests passed"

# Server checks
echo "🔄 Checking if server is reachable"
if ! ping -c 1 $1 &> /dev/null; then
    echo "❌ Server is not reachable"
    exit 1
fi
echo "✅ Server is reachable"

# Deploy
echo "🛈 Deploying to $1"
echo "🔄 Pulling latest code"
ssh $1 "cd /home/ubuntu/app && git pull origin main"
echo "✅ Pulled latest code"

echo "🔄 Installing remote Rails dependencies"
ssh $1 "cd /home/ubuntu/app && bundle install"
echo "✅ Installed Rails dependencies"

echo "🔄 Installing remote Node dependencies"
ssh $1 "cd /home/ubuntu/app/ui && npm install"
echo "✅ Installed Node dependencies"

echo "🔄 Migrating database"
ssh $1 "cd /home/ubuntu/app && bundle exec rails db:migrate"
echo "✅ Migrating database"

echo "🔄 Building UI"
ssh $1 "cd /home/ubuntu/app/ui && npm run build"
echo "✅ Built UI"

echo "🔄 Restarting server"
ssh $1 "sudo systemctl restart budgeting2-api.service"
echo "✅ Restarted server"

echo "🔄 Done"