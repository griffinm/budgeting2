#!/bin/bash

# Script to build and run the production Docker containers
# This script will stop existing containers, rebuild images, and start fresh containers

set -e

export PROJECT_NAME="prod_budgeting2"
export NETWORK_NAME="prod_network"
export DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
export API_CONTAINER_NAME="budgeting2-api"
export UI_CONTAINER_NAME="budgeting2-ui"
export POSTGRES_CONTAINER_NAME="budgeting2-postgres"
export REDIS_CONTAINER_NAME="budgeting2-redis"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production file not found!"
    echo "Creating from template file..."
    if [ -f env.production.template ]; then
        cp env.production.template .env.production
        echo "✏️  Please edit .env.production and add your secret keys"
        echo "You can generate a secret key with: openssl rand -hex 64"
        echo "Or run: ./generate-keys.sh"
        read -p "Press Enter to continue after editing .env.production..."
    else
        echo "❌ Error: env.production.template not found!"
        exit 1
    fi
fi

# Check if master.key exists
if [ ! -f config/master.key ]; then
    echo "⚠️  Warning: config/master.key not found!"
    echo "This is required for Rails credentials. Options:"
    echo "  1. Copy your existing master.key to config/master.key"
    echo "  2. Set RAILS_MASTER_KEY in .env.production" 
    echo "  3. Generate new credentials with: rails credentials:edit"
    read -p "Press Enter to continue..."
fi

echo "🛑 Stopping application containers only (preserving database services)..."
docker stop $API_CONTAINER_NAME $UI_CONTAINER_NAME 2>/dev/null || true
docker rm $API_CONTAINER_NAME $UI_CONTAINER_NAME 2>/dev/null || true

echo "🧹 Removing old images (keeping only latest)..."
docker images | grep "$API_CONTAINER_NAME" | grep -v "latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
docker images | grep "$UI_CONTAINER_NAME" | grep -v "latest" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

echo "🔨 Building application Docker images..."
docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE build api ui #--no-cache

echo "🚀 Starting application containers..."
docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE up -d api ui

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "🗄️  Running database migrations..."
docker exec budgeting2-api bundle exec rails db:prepare 2>/dev/null || echo "⚠️  Note: Migrations skipped (run manually if needed)"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "💾 Database services (PostgreSQL & Redis) were preserved during deployment"
echo ""
echo "📊 Container Status:"
docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE ps
echo ""
echo "🌐 Services are available at:"
echo "   API: http://localhost:10201"
echo "   UI:  http://localhost:10200"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE logs -f"
echo "   Stop app only:    docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE stop api ui"
echo "   Stop all:         docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE down"
echo "   Restart app:      docker compose -p $PROJECT_NAME -f $DOCKER_COMPOSE_FILE restart api ui"
echo "   API logs:         docker logs -f $API_CONTAINER_NAME"
echo "   UI logs:          docker logs -f $UI_CONTAINER_NAME"
echo "   DB logs:          docker logs -f $POSTGRES_CONTAINER_NAME"
echo "   Redis logs:       docker logs -f $REDIS_CONTAINER_NAME"
echo ""

