#!/bin/bash
# ============================================
# Deploy: Deploy to Fly.io
# Usage: make deploy-fly
# 
# This script runs flyctl via Docker container.
# No local flyctl installation required!
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "🚀 Deploying to Fly.io"

cd "$PROJECT_ROOT"

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    print_error "fly.toml not found in project root!"
    exit 1
fi

log "Current fly.toml app configuration:"
grep -E "^app\s*=" fly.toml || true

# Function to run flyctl (via Docker or local)
run_flyctl() {
    if command -v flyctl &> /dev/null; then
        # Use local flyctl if available
        flyctl "$@"
    else
        # Use Docker container
        log "Using flyctl via Docker container..."
        $DC --profile deploy run --rm flyctl "$@"
    fi
}

# Check if we need to authenticate
log "Checking Fly.io authentication..."
if ! run_flyctl auth whoami &>/dev/null; then
    print_warn "Not authenticated with Fly.io"
    echo ""
    echo "Options:"
    echo "  1. Set FLY_API_TOKEN environment variable (for CI/CD)"
    echo "     Generate at: https://fly.io/user/personal_access_tokens"
    echo "     Then: export FLY_API_TOKEN=your_token"
    echo ""
    echo "  2. Run interactive login:"
    echo "     make fly-login"
    echo ""
    
    # Try interactive login if terminal is available
    if [ -t 0 ]; then
        read -p "Would you like to login now? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_flyctl auth login
        else
            exit 1
        fi
    else
        exit 1
    fi
fi

log "Deploying to Fly.io..."
run_flyctl deploy

print_ok "Deployment to Fly.io completed!"
