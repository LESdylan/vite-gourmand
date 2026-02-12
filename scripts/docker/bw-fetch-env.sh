#!/bin/bash
# ============================================
# Bitwarden Vault: Fetch .env secrets
# Usage: make secrets
#        make fetch-env
#
# Prerequisites:
#   Store your Back/.env as a Bitwarden Secure Note
#   named "vite-gourmand-env" (or set BW_ITEM_NAME).
#
# Authentication (pick one):
#   1. Export BW_SESSION=<session_key>  (already logged in & unlocked)
#   2. Set BW_EMAIL + BW_PASSWORD       (auto login)
#   3. Run interactively                (prompted for credentials)
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

BW_ITEM_NAME="${BW_ITEM_NAME:-vite-gourmand-env}"
ENV_DEST="$BACKEND_PATH/.env"

# ── Determine which bw command to use ────────────────
# Prefer local `bw` if installed, otherwise use Docker
# Auto-detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

resolve_bw_cmd() {
    if command -v bw &>/dev/null; then
        BW="bw"
        log "Using local Bitwarden CLI"
    else
        log "No local bw found — using Docker image..."
        # Build the image if not already built
        (cd "$PROJECT_ROOT" && $DC --profile tools build secrets 2>/dev/null)
        BW="$DC --profile tools run --rm -e BW_SESSION secrets"
        log "Docker Bitwarden CLI ready"
    fi
}

# ── Main ─────────────────────────────────────────────
print_header "🔐 Bitwarden Vault → Back/.env"

# Skip if .env already exists
if [ -f "$ENV_DEST" ]; then
    print_ok "Back/.env already exists — skipping vault fetch"
    echo "   (Run 'make secrets-force' to overwrite from vault)"
    exit 0
fi

resolve_bw_cmd

# ── Obtain a session key ────────────────────────────
if [ -z "$BW_SESSION" ]; then
    # Try auto-login with env vars
    if [ -n "$BW_EMAIL" ] && [ -n "$BW_PASSWORD" ]; then
        log "Logging in as $BW_EMAIL..."
        # Login (or unlock if already logged in)
        BW_SESSION=$($BW login "$BW_EMAIL" "$BW_PASSWORD" --raw 2>/dev/null) || \
        BW_SESSION=$($BW unlock "$BW_PASSWORD" --raw 2>/dev/null) || true
    fi

    # If still no session, try interactive
    if [ -z "$BW_SESSION" ]; then
        echo ""
        print_warn "No BW_SESSION found. Please log in interactively:"
        echo ""
        echo "  Option A — Already logged in? Export your session:"
        echo "    export BW_SESSION=\$(bw unlock --raw)"
        echo "    make secrets-force"
        echo ""
        echo "  Option B — Full login:"
        echo "    export BW_SESSION=\$(bw login --raw)"
        echo "    make secrets-force"
        echo ""
        echo "  Option C — Set env vars and retry:"
        echo "    BW_EMAIL=you@mail.com BW_PASSWORD=secret make secrets-force"
        echo ""
        print_warn "Continuing without .env — you can create it manually at Back/.env"
        exit 0
    fi
fi

export BW_SESSION

# ── Sync vault ──────────────────────────────────────
log "Syncing vault..."
$BW sync --session "$BW_SESSION" >/dev/null 2>&1 || true

# ── Fetch the secret ────────────────────────────────
log "Fetching item '$BW_ITEM_NAME'..."

# Try 1: Secure Note content (notes field)
CONTENT=$($BW get notes "$BW_ITEM_NAME" --session "$BW_SESSION" 2>/dev/null) || true

if [ -n "$CONTENT" ] && [ "$CONTENT" != "null" ]; then
    echo "$CONTENT" > "$ENV_DEST"
    print_ok ".env written from Secure Note → Back/.env"
    exit 0
fi

# Try 2: Attachment named ".env" on the item
log "No Secure Note content found, trying attachment '.env'..."
ITEM_ID=$($BW get item "$BW_ITEM_NAME" --session "$BW_SESSION" 2>/dev/null | jq -r '.id') || true

if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    $BW get attachment ".env" --itemid "$ITEM_ID" --output "$ENV_DEST" --session "$BW_SESSION" 2>/dev/null
    if [ -f "$ENV_DEST" ]; then
        print_ok ".env written from attachment → Back/.env"
        exit 0
    fi
fi

# ── Fallback: nothing found ────────────────────────
print_warn "Could not fetch .env from Bitwarden"
echo ""
echo "  Make sure you have an item named '$BW_ITEM_NAME' in your vault"
echo "  containing the .env content as a Secure Note or as an attachment."
echo ""
echo "  You can create it with:"
echo "    bw get template item | jq '.name=\"$BW_ITEM_NAME\" | .type=2 | .notes=\"\$(cat Back/.env)\"' | bw encode | bw create item"
echo ""
echo "  Or simply copy your .env manually to Back/.env"
exit 0
