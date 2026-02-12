#!/bin/bash
# ============================================
# Deploy: View Fly.io Logs
# Usage: make deploy-logs
#
# Runs flyctl via Docker container if not installed locally.
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "📋 Fly.io Application Logs"

cd "$PROJECT_ROOT"

# Function to run flyctl (via Docker or local)
run_flyctl() {
    if command -v flyctl &> /dev/null; then
        flyctl "$@"
    else
        $DC --profile deploy run --rm flyctl "$@"
    fi
}

log "Streaming logs from Fly.io..."
run_flyctl logs
