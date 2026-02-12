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
# Authentication:
#   Interactive — you will be prompted for your credentials.
#   Or pre-export BW_SESSION to skip the login step.
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

BW_ITEM_NAME="${BW_ITEM_NAME:-vite-gourmand-env}"
ENV_DEST="$BACKEND_PATH/.env"

# ── Main ─────────────────────────────────────────────
print_header "🔐 Bitwarden Vault → Back/.env"

# Skip if .env already exists
if [ -f "$ENV_DEST" ]; then
    print_ok "Back/.env already exists — skipping vault fetch"
    echo "   (Run 'make secrets-force' to overwrite from vault)"
    exit 0
fi

# ─────────────────────────────────────────────────────
# Inner script: runs inside the Docker container (or
# locally). Handles the full auth + fetch flow.
#
# Quoted heredoc delimiter ('BWEOF') prevents the outer
# shell from expanding variables — they stay literal
# until the inner bash interprets them.
# ─────────────────────────────────────────────────────
read -r -d '' FETCH_SCRIPT << 'BWEOF' || true
set -e

ITEM="${BW_ITEM_NAME:-vite-gourmand-env}"
DEST="${BW_ENV_DEST:-/work/Back/.env}"

mkdir -p "$(dirname "$DEST")"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔐 Bitwarden Authentication                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── If BW_SESSION is already provided, skip login ────
if [ -n "${BW_SESSION:-}" ]; then
    echo "✅ Using existing BW_SESSION"
    SESSION="$BW_SESSION"
else
    # ── Authenticate interactively ──────────────────
    if bw login --check >/dev/null 2>&1; then
        echo "🔓 Already logged in — enter master password to unlock:"
        echo ""
        SESSION=$(bw unlock --raw) || {
            echo "❌ Unlock failed. Check your master password."
            exit 1
        }
    else
        echo "🔑 Please login with your Bitwarden credentials:"
        echo "   (email, master password, and 2FA if enabled)"
        echo ""
        SESSION=$(bw login --raw) || {
            echo "❌ Login failed. Check your credentials."
            exit 1
        }
    fi
fi

if [ -z "$SESSION" ]; then
    echo "❌ No session key obtained — authentication failed"
    exit 1
fi

echo ""
echo "✅ Authenticated!"
echo ""

# ── Sync vault ──────────────────────────────────────
echo "🔄 Syncing vault..."
bw sync --session "$SESSION" >/dev/null 2>&1 || true

# ── Fetch: try Secure Note first ────────────────────
echo "📦 Fetching item '$ITEM'..."
CONTENT=$(bw get notes "$ITEM" --session "$SESSION" 2>/dev/null) || true

if [ -n "$CONTENT" ] && [ "$CONTENT" != "null" ]; then
    echo "$CONTENT" > "$DEST"
    LINES=$(wc -l < "$DEST")
    echo ""
    echo "✅ .env written ($LINES lines) → $DEST"
    exit 0
fi

# ── Fetch: try attachment named ".env" ──────────────
echo "   No Secure Note content — trying attachment '.env'..."
ITEM_ID=$(bw get item "$ITEM" --session "$SESSION" 2>/dev/null | jq -r '.id') || true

if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    bw get attachment ".env" --itemid "$ITEM_ID" --output "$DEST" --session "$SESSION" 2>/dev/null || true
    if [ -f "$DEST" ] && [ -s "$DEST" ]; then
        echo "✅ .env from attachment → $DEST"
        exit 0
    fi
fi

echo ""
echo "❌ Could not find item '$ITEM' in vault."
echo "   Make sure you have a Bitwarden item named '$ITEM' containing"
echo "   the .env content as a Secure Note or a .env attachment."
exit 1
BWEOF

# ─────────────────────────────────────────────────────
# Choose execution method: local bw CLI or Docker
# ─────────────────────────────────────────────────────
if command -v bw &>/dev/null; then
    # ── Local Bitwarden CLI ─────────────────────────
    log "Using local Bitwarden CLI"
    export BW_ITEM_NAME
    export BW_ENV_DEST="$ENV_DEST"
    export BW_SESSION="${BW_SESSION:-}"
    bash -c "$FETCH_SCRIPT"

else
    # ── Docker-based Bitwarden CLI ──────────────────

    # 1. Verify Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running!"
        echo ""
        echo "  Either start Docker, or install bw locally:"
        echo "    npm install -g @bitwarden/cli"
        exit 1
    fi

    # 2. Build the BW CLI image (filter deprecation warnings, show real errors)
    log "No local bw found — building Docker image from Dockerfile.bw..."
    (cd "$PROJECT_ROOT" && $DC --profile tools build secrets 2>&1 | grep -v "DEPRECATED\|Install the buildx\|https://docs.docker.com/go/buildx") || {
        print_error "Failed to build Bitwarden CLI Docker image"
        echo ""
        echo "  Check that Dockerfile.bw and docker-compose.yml are valid."
        echo "  Try manually: docker compose --profile tools build secrets"
        exit 1
    }
    log "Docker Bitwarden CLI image built ✓"
    echo ""

    # 3. Run the fetch script inside the container
    #    docker compose run allocates a TTY so interactive
    #    bw login/unlock prompts reach the user's terminal.
    #    NOTE: Do NOT pipe this through grep - it breaks TTY allocation for interactive prompts!
    cd "$PROJECT_ROOT"
    $DC --profile tools run --rm \
        --entrypoint bash \
        -e BW_ITEM_NAME="$BW_ITEM_NAME" \
        -e BW_ENV_DEST="/work/Back/.env" \
        -e BW_SESSION="${BW_SESSION:-}" \
        secrets -c "$FETCH_SCRIPT"
fi

# ── Final verification ──────────────────────────────
if [ -f "$ENV_DEST" ] && [ -s "$ENV_DEST" ]; then
    LINES=$(wc -l < "$ENV_DEST")
    print_ok "Back/.env is ready ($LINES lines)"
else
    print_error "Back/.env was not created."
    echo ""
    echo "  You can also create it manually:"
    echo "    cp Back/.env.example Back/.env   # then edit with your values"
    echo "    # or paste your .env content directly into Back/.env"
    exit 1
fi
