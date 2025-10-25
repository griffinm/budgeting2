#!/bin/bash

# Kubernetes Deployment Script for budgeting2
# This script builds, tags, pushes Docker images and deploys to Kubernetes

set -e

# Configuration
REGISTRY="nas.malfin.com:10100"
API_IMAGE_NAME="budgeting2-api"
UI_IMAGE_NAME="budgeting2-ui"
NAMESPACE="prod"
K8S_DIR="k8s"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not in a git repository!"
    exit 1
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    log_warning "You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get git short hash
GIT_HASH=$(git rev-parse --short HEAD)
log_info "Git short hash: $GIT_HASH"

# Image names with tags
API_IMAGE="${REGISTRY}/${API_IMAGE_NAME}:${GIT_HASH}"
UI_IMAGE="${REGISTRY}/${UI_IMAGE_NAME}:${GIT_HASH}"

echo ""
log_info "Building Docker images..."
echo "  API: $API_IMAGE"
echo "  UI:  $UI_IMAGE"
echo ""

# Build API image
log_info "Building API image..."
docker build -t "$API_IMAGE" -f Dockerfile.api .
log_success "API image built"

# Build UI image
log_info "Building UI image..."
docker build -t "$UI_IMAGE" -f Dockerfile.ui .
log_success "UI image built"

# Push images
echo ""
log_info "Pushing images to registry..."

log_info "Pushing API image..."
docker push "$API_IMAGE"
log_success "API image pushed"

log_info "Pushing UI image..."
docker push "$UI_IMAGE"
log_success "UI image pushed"

# Create temporary directory for modified manifests
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

log_info "Preparing Kubernetes manifests..."

# Copy manifests to temp directory and replace GIT_SHORT_HASH placeholder
for file in "$K8S_DIR"/*.yaml; do
    filename=$(basename "$file")
    sed "s|GIT_SHORT_HASH|${GIT_HASH}|g" "$file" > "$TEMP_DIR/$filename"
done

log_success "Manifests prepared"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    log_info "Creating namespace: $NAMESPACE"
    kubectl apply -f "$TEMP_DIR/namespace.yaml"
    log_success "Namespace created"
else
    log_info "Namespace '$NAMESPACE' already exists"
fi

# Check if secret needs to be created
if ! kubectl get secret budgeting2-api-secret -n "$NAMESPACE" > /dev/null 2>&1; then
    log_warning "Secret 'budgeting2-api-secret' does not exist in namespace '$NAMESPACE'"
    log_warning "Please create it before deploying. You can use:"
    log_warning "  ./k8s/generate-secret.sh"
    log_warning "Or apply the template after editing:"
    log_warning "  kubectl apply -f k8s/api-secret.yaml"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Apply Kubernetes manifests
echo ""
log_info "Applying Kubernetes manifests..."

# Apply services
log_info "Applying services..."
kubectl apply -f "$TEMP_DIR/api-service.yaml"
kubectl apply -f "$TEMP_DIR/ui-service.yaml"
log_success "Services applied"

# Apply deployments
log_info "Applying deployments..."
kubectl apply -f "$TEMP_DIR/api-deployment.yaml"
kubectl apply -f "$TEMP_DIR/ui-deployment.yaml"
log_success "Deployments applied"

# Wait for rollout
echo ""
log_info "Waiting for deployments to be ready..."

log_info "Waiting for API deployment..."
kubectl rollout status deployment/budgeting2-api -n "$NAMESPACE" --timeout=5m
log_success "API deployment ready"

log_info "Waiting for UI deployment..."
kubectl rollout status deployment/budgeting2-ui -n "$NAMESPACE" --timeout=5m
log_success "UI deployment ready"

# Show deployment status
echo ""
log_success "Deployment complete!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 Deployment Status"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🏷️  Deployed Images:"
echo "   API: $API_IMAGE"
echo "   UI:  $UI_IMAGE"
echo ""
echo "📦 Pods:"
kubectl get pods -n "$NAMESPACE" -l app=budgeting2-api -o wide
echo ""
kubectl get pods -n "$NAMESPACE" -l app=budgeting2-ui -o wide
echo ""
echo "🔌 Services:"
kubectl get services -n "$NAMESPACE" -l 'app in (budgeting2-api,budgeting2-ui)'
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Useful commands:"
echo "   View API logs:        kubectl logs -f -n $NAMESPACE -l app=budgeting2-api"
echo "   View UI logs:         kubectl logs -f -n $NAMESPACE -l app=budgeting2-ui"
echo "   Describe API pod:     kubectl describe pod -n $NAMESPACE -l app=budgeting2-api"
echo "   Describe UI pod:      kubectl describe pod -n $NAMESPACE -l app=budgeting2-ui"
echo "   Shell into API:       kubectl exec -it -n $NAMESPACE deployment/budgeting2-api -- /bin/bash"
echo "   Port forward API:     kubectl port-forward -n $NAMESPACE svc/budgeting2-api-service 3000:3000"
echo "   Port forward UI:      kubectl port-forward -n $NAMESPACE svc/budgeting2-ui-service 8080:80"
echo ""

