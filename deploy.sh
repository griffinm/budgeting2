#!/bin/bash

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
BOLD='\033[1m'
RESET='\033[0m'

DEPLOY_DIR="/var/www/budgeting2"

# Pretty print functions
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}
print_section() {
    echo -e "\n${BOLD}${BLUE}==============================="
    echo -e "[$(timestamp)] $1"
    echo -e "===============================${RESET}"
}
print_success() {
    echo -e "${GREEN}[$(timestamp)] ✔ $1${RESET}"
}
print_error() {
    echo -e "${RED}[$(timestamp)] ✖ $1${RESET}"
}
print_info() {
    local indent_level=${2:-0}
    local indent=$(printf '\t%.0s' $(seq 1 $indent_level))
    echo -e "${YELLOW}[$(timestamp)] ➜ ${indent}$1${RESET}"
}

# Function to run a command on the remote server
run_remote_command() {
    local server_ip=$1
    local command=$2
    print_info "\tRunning on remote server: $command"
    if ! ssh "$server_ip" "bash -l -c \"$command\"" &>/dev/null; then
        print_error "\tFailed: $command"
        exit 1
    fi
    print_success "\tRemote command succeeded"
}

run_local_command() {
    local command=$1
    print_info "\tRunning locally: $command"
    if ! eval "$command" &>/dev/null; then
        print_error "\tFailed: $command"
        exit 1
    fi
    print_success "\tLocal command succeeded"
}

# Check if the correct number of arguments are provided
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo -e "${RED}✖ Usage: $0 <server_ip> [branch_name]${RESET}"
    echo -e "${YELLOW}  If no branch is specified, 'release' will be used${RESET}"
    exit 1
fi

# Set branch name (default to "release" if not provided)
BRANCH_NAME=${2:-"release"}

print_section "PRE-DEPLOY CHECKS"
print_info "Installing local Ruby dependencies"
run_local_command "bundle install"

print_info "Installing local Node dependencies"
run_local_command "(cd ui && npm install)"

# print_info "Running RSpec tests"
# run_local_command "bundle exec rspec spec/"

print_info "Running UI linting"
run_local_command "npm run lint"

print_section "SERVER CHECKS"
print_info "Checking if server is reachable"
if ping -c 1 $1 &> /dev/null; then
    print_success "Server is reachable"
else
    print_error "Server $1 is not reachable"
    exit 1
fi

print_section "DEPLOYMENT"
print_info "Pulling latest code from branch: $BRANCH_NAME"
run_remote_command $1 "cd $DEPLOY_DIR && git pull origin $BRANCH_NAME"

print_info "Installing remote Rails dependencies"
run_remote_command $1 "cd $DEPLOY_DIR && bundle install"

print_info "Migrating database"
run_remote_command $1 "cd $DEPLOY_DIR && bundle exec rails db:migrate"

print_info "Building UI"
run_local_command "VITE_API_URL=https://bearbudget.griffinmahoney.me/api npm run build"

print_info "Tarring UI"
run_local_command "tar -czf ui/ui.tar.gz ui/dist"

print_info "Copying UI to remote server"
run_remote_command $1 "mkdir -p $DEPLOY_DIR/ui/dist"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/*"
run_local_command "scp ui/ui.tar.gz $1:$DEPLOY_DIR/ui/ui.tar.gz"
run_remote_command $1 "tar -xzf $DEPLOY_DIR/ui/ui.tar.gz -C $DEPLOY_DIR/ui/dist"
run_remote_command $1 "mv $DEPLOY_DIR/ui/dist/ui/dist/* $DEPLOY_DIR/ui/dist"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/ui"

print_info "Restarting API"
run_remote_command $1 "sudo systemctl restart budgeting2-api.service"

print_info "Restarting worker"
run_remote_command $1 "sudo systemctl restart budgeting2-worker.service"

print_section "${GREEN}DEPLOYMENT COMPLETE${RESET}"
print_success "All steps finished successfully!"
