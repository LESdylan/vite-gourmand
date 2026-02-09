#!/bin/bash
# ============================================
# Common utilities for all scripts
# Source this file: source "$(dirname "$0")/lib/common.sh"
# ============================================

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_PATH="$PROJECT_ROOT/Back"
FRONTEND_PATH="$PROJECT_ROOT/Front"
DOCS_PATH="$PROJECT_ROOT/docs"
ENV_FILE="$BACKEND_PATH/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Counters for summary
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# ── Logging Functions ─────────────────────────────────
log()       { echo -e "${BLUE}[INFO]${NC} $1"; }
log_section() { echo -e "\n${CYAN}═══ $1 ═══${NC}"; }
log_subsection() { echo -e "${DIM}── $1 ──${NC}"; }
log_detail() { echo -e "   $1"; }
log_pass()  { echo -e "   ${GREEN}✓${NC} $1"; }
log_fail()  { echo -e "   ${RED}✗${NC} $1"; }
log_warn()  { echo -e "   ${YELLOW}⚠${NC} $1"; }

print_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
print_fail()  { echo -e "${RED}❌ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }  # alias for print_fail
print_warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info()  { echo -e "${BLUE}ℹ️  $1${NC}"; }

print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${BOLD}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ── Counter Functions ─────────────────────────────────
count_pass() { ((PASS_COUNT++)); }
count_fail() { ((FAIL_COUNT++)); }
count_warn() { ((WARN_COUNT++)); }
reset_counters() { PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0; }

print_summary() {
    echo ""
    echo -e "${BOLD}Summary:${NC} ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}, ${YELLOW}$WARN_COUNT warnings${NC}"
}

# ── Environment Functions ─────────────────────────────
load_env() {
    if [[ -f "$ENV_FILE" ]]; then
        export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs) 2>/dev/null
        return 0
    else
        return 1
    fi
}

get_env() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2- | tr -d '"'
}

# ── Validation Functions ──────────────────────────────
check_file_exists() {
    local file="$1"
    local desc="${2:-file}"
    [[ -f "$file" ]]
}

check_package_installed() {
    local pkg="$1"
    grep -q "\"$pkg\"" "$BACKEND_PATH/package.json" 2>/dev/null
}

check_backend_running() {
    curl -s "http://localhost:3000/api" &>/dev/null
}

docker_container_running() {
    local name="$1"
    docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${name}$"
}

# ── Export for subshells ──────────────────────────────
export PROJECT_ROOT BACKEND_PATH FRONTEND_PATH DOCS_PATH ENV_FILE
export RED GREEN YELLOW BLUE CYAN MAGENTA BOLD DIM NC
