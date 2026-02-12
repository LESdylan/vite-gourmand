#!/bin/bash
# ============================================
# Deploy: Check Deployment Status
# Usage: make deploy-status
#
# Runs flyctl via Docker container if not installed locally.
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "📊 Deployment Status"

cd "$PROJECT_ROOT"

# Function to run flyctl (via Docker or local)
run_flyctl() {
    if command -v flyctl &> /dev/null; then
        flyctl "$@"
    else
        $DC --profile deploy run --rm flyctl "$@"
    fi
}

log "Application Status:"
run_flyctl status

echo ""
log "Application Info:"
run_flyctl info

echo ""
log "Recent Releases:"
run_flyctl releases --json 2>/dev/null | node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
if (Array.isArray(data)) {
    data.slice(0, 5).forEach(r => {
        console.log('  ' + r.Version + ' - ' + r.Status + ' - ' + (r.Description || 'N/A') + ' - ' + r.CreatedAt);
    });
}
" 2>/dev/null || run_flyctl releases

print_ok "Status check completed!"
