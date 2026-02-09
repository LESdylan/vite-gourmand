#!/bin/bash
# ============================================
# Deploy: Check Deployment Status
# Usage: make deploy-status
# ============================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

print_header "📊 Deployment Status"

cd "$PROJECT_ROOT"

if ! command -v flyctl &> /dev/null; then
    print_error "flyctl not found!"
    exit 1
fi

log "Application Status:"
flyctl status

echo ""
log "Application Info:"
flyctl info

echo ""
log "Recent Releases:"
flyctl releases --json 2>/dev/null | node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
if (Array.isArray(data)) {
    data.slice(0, 5).forEach(r => {
        console.log('  ' + r.Version + ' - ' + r.Status + ' - ' + (r.Description || 'N/A') + ' - ' + r.CreatedAt);
    });
}
" 2>/dev/null || flyctl releases

print_ok "Status check completed!"
