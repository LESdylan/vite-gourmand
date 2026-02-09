#!/bin/bash
# ============================================
# Deploy: Deploy to Fly.io
# Usage: make deploy-fly
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "🚀 Deploying to Fly.io"

cd "$PROJECT_ROOT"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl not found! Install it from https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    print_error "fly.toml not found in project root!"
    exit 1
fi

log "Current fly.toml app configuration:"
grep -E "^app\s*=" fly.toml || true

log "Deploying to Fly.io..."
flyctl deploy

print_ok "Deployment to Fly.io completed!"
