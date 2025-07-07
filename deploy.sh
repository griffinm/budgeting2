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
    echo -e "\t${GREEN}[$(timestamp)] ✔ $1${RESET}"
}
print_error() {
    echo -e "\t${RED}[$(timestamp)] ✖ $1${RESET}"
}
print_info() {
    echo -e "\t${YELLOW}[$(timestamp)] ➜ $1${RESET}"
}

# Function to run a command on the remote server
run_remote_command() {
    local server_ip=$1
    local command=$2
    print_info "Running remote: $command"
    if ! ssh "$server_ip" "bash -l -c \"$command\"" &>/dev/null; then
        print_error "Failed: $command"
        exit 1
    fi
    print_success "Remote command succeeded"
}

run_local_command() {
    local command=$1
    print_info "Running local: $command"
    if ! eval "$command" &>/dev/null; then
        print_error "Failed: $command"
        exit 1
    fi
    print_success "Local command succeeded"
}

# Check if the correct number of arguments are provided
if [ $# -ne 1 ]; then
    echo -e "${RED}✖ Usage: $0 <server_ip>${RESET}"
    exit 1
fi

print_section "PRE-DEPLOY CHECKS"
print_info "Installing local Ruby dependencies"
run_local_command "bundle install"

print_info "Installing local Node dependencies"
run_local_command "(cd ui && npm install)"

print_info "Running RSpec tests"
run_local_command "bundle exec rspec spec/"

print_section "SERVER CHECKS"
print_info "Checking if server is reachable"
if ping -c 1 $1 &> /dev/null; then
    print_success "Server is reachable"
else
    print_error "Server $1 is not reachable"
    exit 1
fi

print_section "DEPLOYMENT"
print_info "Pulling latest code"
run_remote_command $1 "cd $DEPLOY_DIR && git pull origin main"

print_info "Installing remote Rails dependencies"
run_remote_command $1 "cd $DEPLOY_DIR && bundle install"

print_info "Migrating database"
run_remote_command $1 "cd $DEPLOY_DIR && bundle exec rails db:migrate"

print_info "Building UI"
run_local_command "npm run build"

print_info "Tarring UI"
run_local_command "tar -czf ui/ui.tar.gz ui/dist"

print_info "Copying UI to remote server"
run_remote_command $1 "mkdir -p $DEPLOY_DIR/ui/dist"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/*"
run_local_command "scp ui/ui.tar.gz $1:$DEPLOY_DIR/ui/ui.tar.gz"
run_remote_command $1 "tar -xzf $DEPLOY_DIR/ui/ui.tar.gz -C $DEPLOY_DIR/ui/dist"
run_remote_command $1 "mv $DEPLOY_DIR/ui/dist/ui/dist/* $DEPLOY_DIR/ui/dist"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/ui"

print_info "Restarting server"
run_remote_command $1 "sudo systemctl restart budgeting2-api.service"

print_section "${GREEN}DEPLOYMENT COMPLETE${RESET}"
print_success "All steps finished successfully!"