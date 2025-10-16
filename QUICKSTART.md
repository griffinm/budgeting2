# Quick Start Guide - Docker Deployment

Get your budgeting app running in Docker in 3 steps!

## Prerequisites

- Docker and Docker Compose installed
- Docker Desktop running (optional but recommended)

## Step 1: Generate Keys

```bash
./generate-keys.sh
```

This will create `.env.production` with a generated `SECRET_KEY_BASE`.

## Step 2: Configure Secrets (Optional)

If your app needs additional configuration:

```bash
nano .env.production
```

Add any required API keys or secrets. Common ones:
- `RAILS_MASTER_KEY` - If you have existing Rails credentials
- `PLAID_CLIENT_ID`, `PLAID_SECRET` - For Plaid integration
- Any other service API keys

## Step 3: Deploy

```bash
./deploy-prod.sh
```

This will:
- Build Docker images
- Start all services
- Run database migrations
- Configure restart policies

## Access Your App

- **UI (Frontend):** http://localhost:11100
- **API (Backend):** http://localhost:11000

## Common Commands

```bash
# View all logs
docker-compose -p prod -f docker-compose.prod.yml logs -f

# Stop everything
docker-compose -p prod -f docker-compose.prod.yml down

# Restart
./deploy-prod.sh

# Rails console
docker exec -it budgeting2-api bundle exec rails console

# Check status
docker-compose -p prod -f docker-compose.prod.yml ps
```

## Docker Desktop

All containers will appear under the "prod" project in Docker Desktop for easy management.

## Need Help?

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed documentation and troubleshooting.

