#!/bin/bash

# Helper script to generate Kubernetes secret from .env.prod file
# This script reads .env.prod and creates a Kubernetes secret

set -e

NAMESPACE="prod"
SECRET_NAME="budgeting2-api-secret"
ENV_FILE="../.env.prod"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env.prod exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env.prod file not found!"
    log_info "Please create .env.prod with your configuration"
    log_info "You can use env.production.template as a starting point:"
    log_info "  cp ../env.production.template ../.env.prod"
    exit 1
fi

log_info "Found .env.prod file"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    log_warning "Namespace '$NAMESPACE' does not exist"
    log_info "Creating namespace..."
    kubectl create namespace "$NAMESPACE"
    log_success "Namespace created"
fi

# Check if secret already exists
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    log_warning "Secret '$SECRET_NAME' already exists in namespace '$NAMESPACE'"
    read -p "Do you want to delete and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE"
        log_info "Existing secret deleted"
    else
        log_info "Aborting"
        exit 0
    fi
fi

# Create secret from env file
log_info "Creating secret from .env.prod..."
kubectl create secret generic "$SECRET_NAME" \
    --from-env-file="$ENV_FILE" \
    --namespace="$NAMESPACE"

log_success "Secret created successfully!"
echo ""
log_info "Secret details:"
kubectl describe secret "$SECRET_NAME" -n "$NAMESPACE"

echo ""
log_success "You can now deploy the application with: ../deploy-k8s.sh"

