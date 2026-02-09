#!/bin/bash
# ============================================
# Deploy: View Fly.io Logs
# Usage: make deploy-logs
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "📋 Fly.io Application Logs"

cd "$PROJECT_ROOT"

if ! command -v flyctl &> /dev/null; then
    print_error "flyctl not found!"
    exit 1
fi

log "Streaming logs from Fly.io..."
flyctl logs
