# Kubernetes Deployment Guide

This directory contains Kubernetes manifests and scripts for deploying the budgeting2 application to a Kubernetes cluster.

## Architecture

The deployment consists of:

- **API Service**: Rails backend application
  - Namespace: `prod`
  - Replicas: 1
  - Resources: 256Mi memory, 2 CPU
  - Image: `nas.malfin.com:10100/budgeting2-api:[git-hash]`
  - Logs to stdout (viewable with kubectl logs)

- **UI Service**: React frontend with Nginx
  - Namespace: `prod`
  - Replicas: 1
  - Resources: 64Mi memory, 2 CPU
  - Image: `nas.malfin.com:10100/budgeting2-ui:[git-hash]`
  - Proxies `/api` requests to API service

## Prerequisites

1. **Kubernetes cluster** with kubectl configured
2. **Docker** for building images
3. **Access to registry**: `nas.malfin.com:10100`
4. **External services** in the cluster:
   - PostgreSQL (DNS: `postgres`)
   - Redis (DNS: `redis`)

## Initial Setup

### 1. Create Environment Configuration

If you don't have a `.env.prod` file, create one:

```bash
cp env.production.template .env.prod
```

Edit `.env.prod` and set your actual values, especially:
- `SECRET_KEY_BASE` (generate with: `openssl rand -hex 64`)
- `DATABASE_PASSWORD`
- `PLAID_CLIENT_ID` and `PLAID_SECRET` (get from https://dashboard.plaid.com/team/keys)
- `RAILS_MASTER_KEY` (if using encrypted credentials)

### 2. Create Kubernetes Secret

Run the helper script to create the secret from your `.env.prod` file:

```bash
./k8s/generate-secret.sh
```

Or manually create it:

```bash
kubectl create secret generic budgeting2-api-secret \
  --from-env-file=.env.prod \
  --namespace=prod
```

### 3. Create Namespace (if needed)

```bash
kubectl apply -f k8s/namespace.yaml
```

## Deployment

### Automated Deployment

Use the deployment script to build, push, and deploy:

```bash
./deploy-k8s.sh
```

This script will:
1. Get the current git short hash
2. Build Docker images for API and UI
3. Tag images with the git hash
4. Push images to `nas.malfin.com:10100`
5. Update Kubernetes manifests with the new image tags
6. Apply manifests to the cluster
7. Wait for rollout to complete
8. Display deployment status

### Manual Deployment

If you prefer to deploy manually:

```bash
# Get git hash
GIT_HASH=$(git rev-parse --short HEAD)

# Build and push images
docker build -t nas.malfin.com:10100/budgeting2-api:${GIT_HASH} -f Dockerfile.api .
docker push nas.malfin.com:10100/budgeting2-api:${GIT_HASH}

docker build -t nas.malfin.com:10100/budgeting2-ui:${GIT_HASH} -f Dockerfile.ui .
docker push nas.malfin.com:10100/budgeting2-ui:${GIT_HASH}

# Update manifests (replace GIT_SHORT_HASH with actual hash)
sed -i "s/GIT_SHORT_HASH/${GIT_HASH}/g" k8s/api-deployment.yaml
sed -i "s/GIT_SHORT_HASH/${GIT_HASH}/g" k8s/ui-deployment.yaml

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/api-pvc.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/ui-service.yaml
kubectl apply -f k8s/ui-deployment.yaml
```

## Manifest Files

- `namespace.yaml` - Creates the `prod` namespace
- `api-secret.yaml` - Secret template for API environment variables
- `api-service.yaml` - ClusterIP service for API (port 3000)
- `api-deployment.yaml` - API deployment with resource limits
- `ui-service.yaml` - ClusterIP service for UI (port 80)
- `ui-deployment.yaml` - UI deployment with resource limits

Note: `api-pvc.yaml` is not currently used as the API logs to stdout.

## Useful Commands

### View Resources

```bash
# All resources in prod namespace
kubectl get all -n prod

# Pods
kubectl get pods -n prod

# Services
kubectl get services -n prod

# Deployments
kubectl get deployments -n prod
```

### View Logs

```bash
# API logs
kubectl logs -f -n prod -l app=budgeting2-api

# UI logs
kubectl logs -f -n prod -l app=budgeting2-ui

# Specific pod
kubectl logs -f -n prod <pod-name>
```

### Debugging

```bash
# Describe pod
kubectl describe pod -n prod <pod-name>

# Shell into API container
kubectl exec -it -n prod deployment/budgeting2-api -- /bin/bash

# Shell into UI container
kubectl exec -it -n prod deployment/budgeting2-ui -- /bin/sh
```

### Port Forwarding (for testing)

```bash
# Forward API port
kubectl port-forward -n prod svc/budgeting2-api-service 3000:3000

# Forward UI port
kubectl port-forward -n prod svc/budgeting2-ui-service 8080:80
```

### Update Deployment

```bash
# Restart deployments
kubectl rollout restart deployment/budgeting2-api -n prod
kubectl rollout restart deployment/budgeting2-ui -n prod

# Check rollout status
kubectl rollout status deployment/budgeting2-api -n prod
kubectl rollout status deployment/budgeting2-ui -n prod

# Rollback to previous version
kubectl rollout undo deployment/budgeting2-api -n prod
```

### Scale Replicas

```bash
# Scale API (though configured for 1 replica)
kubectl scale deployment/budgeting2-api -n prod --replicas=2

# Scale UI
kubectl scale deployment/budgeting2-ui -n prod --replicas=2
```

### Delete Resources

```bash
# Delete specific deployment
kubectl delete deployment budgeting2-api -n prod

# Delete all resources (WARNING: destructive)
kubectl delete all -l app=budgeting2-api -n prod
kubectl delete all -l app=budgeting2-ui -n prod

# Delete namespace (WARNING: deletes everything in it)
kubectl delete namespace prod
```

## Database Migrations

After deploying the API, you may need to run database migrations:

```bash
# Run migrations
kubectl exec -n prod deployment/budgeting2-api -- bundle exec rails db:migrate

# Or prepare database (create, migrate, seed)
kubectl exec -n prod deployment/budgeting2-api -- bundle exec rails db:prepare
```

## Logging

The API logs to stdout, which can be viewed using:
```bash
kubectl logs -f -n prod -l app=budgeting2-api
```

All logs are captured by Kubernetes and can be accessed through kubectl or your cluster's logging solution.

## Networking

- **UI to API**: The UI service connects to the API via nginx reverse proxy at `/api`, which is proxied to `http://budgeting2-api-service.prod.svc.cluster.local:3000`
- **API to Database**: The API connects to PostgreSQL at `postgres:5432` (assumes PostgreSQL service exists in the same namespace)
- **API to Redis**: The API connects to Redis at `redis:6379` (assumes Redis service exists in the same namespace)

## Security Notes

1. **Secret Management**: The `api-secret.yaml` contains sensitive data. Never commit the actual secret values to git.
2. **Image Registry**: Ensure proper authentication for `nas.malfin.com:10100`
3. **Database Credentials**: Update the database password in the secret before deployment
4. **SSL/TLS**: The current configuration has `RAILS_FORCE_SSL=false`. Enable it if using HTTPS.

## Troubleshooting

### Pod not starting

```bash
# Check pod events
kubectl describe pod -n prod <pod-name>

# Check logs
kubectl logs -n prod <pod-name>
```

### Image pull errors

Ensure you're authenticated to the registry:
```bash
docker login nas.malfin.com:10100
```

### Database connection issues

Verify PostgreSQL service exists and is accessible:
```bash
kubectl get svc postgres -n prod
```

### Secret missing

Create the secret:
```bash
./k8s/generate-secret.sh
```

