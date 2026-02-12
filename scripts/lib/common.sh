#!/bin/bash
# ============================================
# Common utilities for all scripts
# Source this file: source "$SCRIPT_DIR/lib/common.sh"
# ============================================

# Paths - determine based on where this file is located
SCRIPT_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_LIB_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"
BACKEND_PATH="$PROJECT_ROOT/Back"
FRONTEND_PATH="$PROJECT_ROOT/View"
DOCS_PATH="$PROJECT_ROOT/docs"
ENV_FILE="$BACKEND_PATH/.env"

# Docker container names (match docker-compose.yml)
POSTGRES_CONTAINER="vite-gourmand-db-1"
MONGO_CONTAINER="vite-gourmand-mongo-1"

# Auto-detect docker compose command (v2 plugin vs v1 standalone)
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

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

# Verbose mode
VERBOSE="${VERBOSE:-false}"

# ── Logging Functions ─────────────────────────────────
log()            { echo -e "${BLUE}[INFO]${NC} $1"; }
log_section()    { echo -e "\n${CYAN}═══ $1 ═══${NC}"; }
log_subsection() { echo -e "${DIM}── $1 ──${NC}"; }
log_detail()     { echo -e "   $1"; }
log_pass()       { echo -e "   ${GREEN}✓${NC} $1"; }
log_fail()       { echo -e "   ${RED}✗${NC} $1"; }
log_warn()       { echo -e "   ${YELLOW}⚠${NC} $1"; }
log_end_section(){ echo -e "${DIM}───────────────────────────${NC}"; }

print_ok()       { echo -e "${GREEN}✅ $1${NC}"; }
print_fail()     { echo -e "${RED}❌ $1${NC}"; }
print_error()    { echo -e "${RED}❌ $1${NC}"; }
print_warn()     { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info()     { echo -e "${BLUE}ℹ️  $1${NC}"; }

print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${BOLD}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${DIM}[VERBOSE] $1${NC}"
    fi
}

log_file_content() {
    local file="$1"
    local lines="${2:-10}"
    if [[ -f "$file" ]]; then
        echo -e "${DIM}$(head -n "$lines" "$file")${NC}"
    fi
}

# ── Counter Functions ─────────────────────────────────
count_pass() { ((PASS_COUNT++)) || true; }
count_fail() { ((FAIL_COUNT++)) || true; }
count_warn() { ((WARN_COUNT++)) || true; }
reset_counters() { PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0; }

print_summary() {
    echo ""
    echo -e "${BOLD}Summary:${NC} ${GREEN}$PASS_COUNT passed${NC}, ${RED}$FAIL_COUNT failed${NC}, ${YELLOW}$WARN_COUNT warnings${NC}"
}

# ── Environment Functions ─────────────────────────────
load_env() {
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        source "$ENV_FILE" 2>/dev/null || true
        set +a
        return 0
    else
        return 1
    fi
}

get_env() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'"
}

# ── Validation Functions ──────────────────────────────
check_file_exists() {
    local file="$1"
    local desc="${2:-file}"
    if [[ -f "$file" ]]; then
        print_ok "$desc exists"
        log_pass "$desc found"
        return 0
    else
        print_fail "$desc not found"
        log_fail "$desc missing: $file"
        return 1
    fi
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
    docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$name"
}

# ── Require Functions ─────────────────────────────────
require_command() {
    local cmd="$1"
    local name="${2:-$cmd}"
    if ! command -v "$cmd" &>/dev/null; then
        print_error "$name is required but not installed"
        exit 1
    fi
}

require_file() {
    local file="$1"
    local desc="${2:-$file}"
    if [[ ! -f "$file" ]]; then
        print_error "Required file missing: $desc"
        exit 1
    fi
}

require_env() {
    local var="$1"
    if [[ -z "${!var:-}" ]]; then
        print_error "Required environment variable not set: $var"
        exit 1
    fi
}

# ── Export for subshells ──────────────────────────────
export PROJECT_ROOT BACKEND_PATH FRONTEND_PATH DOCS_PATH ENV_FILE
export POSTGRES_CONTAINER MONGO_CONTAINER
export RED GREEN YELLOW BLUE CYAN MAGENTA BOLD DIM NC
export VERBOSE
