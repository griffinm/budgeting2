#!/bin/bash

set -e

# Enhanced color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

DEPLOY_DIR="/var/www/budgeting2"
TOTAL_STEPS=12
CURRENT_STEP=0

# ASCII Art
print_banner() {
    echo -e "${BOLD}${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║    🚀  BUDGETING2 DEPLOYMENT SCRIPT  🚀                     ║"
    echo "║                                                              ║"
    echo "║    Professional deployment automation with style            ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
}

# Progress tracking
update_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local percentage=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    local filled=$((percentage / 5))
    local empty=$((20 - filled))
    
    printf "\r${BOLD}${BLUE}Progress: [${GREEN}"
    printf "%*s" $filled | tr ' ' '█'
    printf "${DIM}"
    printf "%*s" $empty | tr ' ' '░'
    printf "${BLUE}] ${percentage}%% (${CURRENT_STEP}/${TOTAL_STEPS})${RESET}"
    echo ""
}

# Enhanced print functions
timestamp() {
    date '+%H:%M:%S'
}

print_section() {
    echo -e "\n${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${PURPLE}║${WHITE}  $1${PURPLE}  ║${RESET}"
    echo -e "${BOLD}${PURPLE}╚══════════════════════════════════════════════════════════════╝${RESET}\n"
}

print_success() {
    echo -e "  ${GREEN}✅ [$(timestamp)] $1${RESET}"
}

print_error() {
    echo -e "  ${RED}❌ [$(timestamp)] $1${RESET}"
}

print_info() {
    local indent_level=${2:-0}
    local indent=$(printf '  %.0s' $(seq 1 $indent_level))
    echo -e "  ${YELLOW}🔄 [$(timestamp)] ${indent}$1${RESET}"
}

print_warning() {
    echo -e "  ${YELLOW}⚠️  [$(timestamp)] $1${RESET}"
}

print_step() {
    echo -e "\n${BOLD}${CYAN}┌─ Step $CURRENT_STEP/$TOTAL_STEPS: $1${RESET}"
    echo -e "${BOLD}${CYAN}└─────────────────────────────────────────────────────────────${RESET}"
}

# Enhanced command execution functions
run_remote_command() {
    local server_ip=$1
    local command=$2
    local description=${3:-"Remote command"}
    
    print_info "🌐 $description"
    print_info "   Command: ${DIM}$command${RESET}"
    
    if ssh "$server_ip" "bash -l -c \"$command\"" &>/dev/null; then
        print_success "$description completed"
    else
        print_error "$description failed"
        print_error "   Command: $command"
        print_error "   Server: $server_ip"
        exit 1
    fi
}

run_local_command() {
    local command=$1
    local description=${2:-"Local command"}
    
    print_info "💻 $description"
    print_info "   Command: ${DIM}$command${RESET}"
    
    if eval "$command" &>/dev/null; then
        print_success "$description completed"
    else
        print_error "$description failed"
        print_error "   Command: $command"
        exit 1
    fi
}

# Check if the correct number of arguments are provided
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    print_banner
    echo -e "${RED}❌ Usage: $0 <server_ip> [branch_name]${RESET}"
    echo -e "${YELLOW}  💡 If no branch is specified, 'release' will be used${RESET}"
    exit 1
fi

# Set branch name (default to "release" if not provided)
BRANCH_NAME=${2:-"release"}

# Display banner
print_banner

print_section "🚀 PRE-DEPLOYMENT CHECKS"

print_step "Installing Ruby Dependencies"
run_local_command "bundle install" "Installing Ruby dependencies"
update_progress

print_step "Installing Node Dependencies"
run_local_command "(cd ui && npm install)" "Installing Node.js dependencies"
update_progress

# print_step "Running Tests"
# run_local_command "bundle exec rspec spec/" "Running RSpec tests"
# update_progress

print_step "Linting UI Code"
run_local_command "npm run lint" "Running UI linting"
update_progress

print_section "🌐 SERVER CONNECTIVITY"
print_step "Testing Server Connection"
print_info "🔍 Checking if server is reachable"
if ping -c 1 $1 &> /dev/null; then
    print_success "Server $1 is reachable"
else
    print_error "Server $1 is not reachable"
    exit 1
fi
update_progress

print_section "🚀 DEPLOYMENT PROCESS"
print_step "Pulling Latest Code"
run_remote_command $1 "cd $DEPLOY_DIR && git pull origin $BRANCH_NAME" "Pulling latest code from branch: $BRANCH_NAME"
update_progress

print_step "Installing Remote Dependencies"
run_remote_command $1 "cd $DEPLOY_DIR && bundle install" "Installing Rails dependencies on server"
update_progress

print_step "Database Migration"
run_remote_command $1 "cd $DEPLOY_DIR && bundle exec rails db:migrate" "Running database migrations"
update_progress

print_info "Building UI"
run_local_command "VITE_API_URL=https://bearbudget.griffinmahoney.me/api npm run build"

print_step "Packaging UI Assets"
run_local_command "tar -czf ui/ui.tar.gz ui/dist" "Creating UI deployment package"
update_progress

print_step "Deploying UI to Server"
run_remote_command $1 "mkdir -p $DEPLOY_DIR/ui/dist" "Creating UI directory on server"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/*" "Cleaning existing UI files"
run_local_command "scp ui/ui.tar.gz $1:$DEPLOY_DIR/ui/ui.tar.gz" "Uploading UI package to server"
run_remote_command $1 "tar -xzf $DEPLOY_DIR/ui/ui.tar.gz -C $DEPLOY_DIR/ui/dist" "Extracting UI files"
run_remote_command $1 "mv $DEPLOY_DIR/ui/dist/ui/dist/* $DEPLOY_DIR/ui/dist" "Organizing UI files"
run_remote_command $1 "rm -rf $DEPLOY_DIR/ui/dist/ui" "Cleaning up temporary files"
update_progress

print_step "Restarting Services"
run_remote_command $1 "sudo systemctl restart budgeting2-api.service" "Restarting API service"
update_progress

# print_step "Restarting Worker"
# run_remote_command $1 "sudo systemctl restart budgeting2-worker.service" "Restarting worker service"
# update_progress

print_section "🎉 DEPLOYMENT COMPLETE"
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║${WHITE}                    🎊 SUCCESS! 🎊                        ${GREEN}║${RESET}"
echo -e "${BOLD}${GREEN}║                                                              ║${RESET}"
echo -e "${BOLD}${GREEN}║${WHITE}  Your application has been successfully deployed!        ${GREEN}║${RESET}"
echo -e "${BOLD}${GREEN}║${WHITE}  Branch: ${BRANCH_NAME}${WHITE}                                    ${GREEN}║${RESET}"
echo -e "${BOLD}${GREEN}║${WHITE}  Server: $1${WHITE}                                    ${GREEN}║${RESET}"
echo -e "${BOLD}${GREEN}║${WHITE}  Time: $(date '+%Y-%m-%d %H:%M:%S')${WHITE}                        ${GREEN}║${RESET}"
echo -e "${BOLD}${GREEN}║                                                              ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════╝${RESET}"
print_success "All deployment steps completed successfully!"
