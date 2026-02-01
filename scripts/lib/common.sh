#!/bin/bash
# ==========================================
# VITE GOURMAND DIAGNOSTIC - COMMON LIBRARY
# ==========================================
# Shared functions for all diagnostic scripts
# Source this file: source "$(dirname "$0")/lib/common.sh"
# ==========================================

# Configuration
export POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-vite-gourmand-db-1}"
export MONGO_CONTAINER="${MONGO_CONTAINER:-vite-gourmand-mongo-1}"
export BACKEND_PATH="${BACKEND_PATH:-./backend}"
export FRONTEND_PATH="${FRONTEND_PATH:-./frontend}"
export LOG_DIR="${LOG_DIR:-./data/logs}"
export LOG_FILE="${LOG_FILE:-$LOG_DIR/diagnostic.txt}"
export VERBOSE="${VERBOSE:-false}"

# Colors
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export MAGENTA='\033[0;35m'
export BOLD='\033[1m'
export NC='\033[0m' # No Color

# ==========================================
# LOGGING FUNCTIONS
# ==========================================

function init_log() {
    mkdir -p "$LOG_DIR"
    echo "" >> "$LOG_FILE"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗" >> "$LOG_FILE"
    echo "║                    VITE GOURMAND DIAGNOSTIC - VERBOSE LOG                    ║" >> "$LOG_FILE"
    echo "╠══════════════════════════════════════════════════════════════════════════════╣" >> "$LOG_FILE"
    echo "║  Date: $(date '+%Y-%m-%d %H:%M:%S')                                                     ║" >> "$LOG_FILE"
    echo "║  User: $(whoami)                                                                   ║" >> "$LOG_FILE"
    echo "║  PWD:  $(pwd)" >> "$LOG_FILE"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

function log_section() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "" >> "$LOG_FILE"
        echo "┌──────────────────────────────────────────────────────────────────────────────┐" >> "$LOG_FILE"
        echo "│  $1" >> "$LOG_FILE"
        echo "├──────────────────────────────────────────────────────────────────────────────┤" >> "$LOG_FILE"
    fi
}

function log_subsection() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "" >> "$LOG_FILE"
        echo "  ▶ $1" >> "$LOG_FILE"
        echo "  ─────────────────────────────────────────────────" >> "$LOG_FILE"
    fi
}

function log_detail() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "    $1" >> "$LOG_FILE"
    fi
}

function log_code() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "    │ $1" >> "$LOG_FILE"
    fi
}

function log_pass() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "    ✅ PASS: $1" >> "$LOG_FILE"
    fi
}

function log_fail() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "    ❌ FAIL: $1" >> "$LOG_FILE"
    fi
}

function log_warn() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "    ⚠️  WARN: $1" >> "$LOG_FILE"
    fi
}

function log_end_section() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "└──────────────────────────────────────────────────────────────────────────────┘" >> "$LOG_FILE"
    fi
}

function log_file_content() {
    local file="$1"
    local max_lines="${2:-50}"
    if [[ "$VERBOSE" == "true" ]] && [[ -f "$file" ]]; then
        head -"$max_lines" "$file" | while IFS= read -r line; do
            log_code "$line"
        done
    fi
}

# ==========================================
# PRINT FUNCTIONS (Console Output)
# ==========================================

function print_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

function print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

function print_header() {
    echo ""
    echo -e "${BOLD}$1${NC}"
    echo "=========================================="
}

function print_subheader() {
    echo -e "${CYAN}$1${NC}"
}

function print_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${CYAN}   📝 Logged to: $LOG_FILE${NC}"
    fi
}

# ==========================================
# UTILITY FUNCTIONS
# ==========================================

function check_file_exists() {
    local file="$1"
    local name="$2"
    
    if [[ -f "$file" ]]; then
        print_ok "$name exists"
        log_pass "$name exists"
        return 0
    else
        print_error "$name missing"
        log_fail "$name missing at $file"
        return 1
    fi
}

function check_package_installed() {
    local package="$1"
    local package_json="${2:-$BACKEND_PATH/package.json}"
    
    if grep -q "\"$package\"" "$package_json" 2>/dev/null; then
        print_ok "$package installed"
        log_pass "$package installed"
        if [[ "$VERBOSE" == "true" ]]; then
            version=$(grep -o "\"$package\": \"[^\"]*\"" "$package_json")
            log_detail "Version: $version"
        fi
        return 0
    else
        print_error "$package not installed"
        log_fail "$package not installed"
        return 1
    fi
}

function check_grep_in_file() {
    local pattern="$1"
    local file="$2"
    local success_msg="$3"
    local fail_msg="$4"
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        print_ok "$success_msg"
        log_pass "$success_msg"
        return 0
    else
        print_error "$fail_msg"
        log_fail "$fail_msg"
        return 1
    fi
}

function docker_container_running() {
    local container="$1"
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
    [[ "$status" == "running" ]]
}

function docker_container_healthy() {
    local container="$1"
    local health
    health=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null)
    [[ "$health" == "healthy" ]]
}

# ==========================================
# RESULT TRACKING
# ==========================================

declare -g CHECK_PASSED=0
declare -g CHECK_FAILED=0
declare -g CHECK_WARNED=0

function reset_counters() {
    CHECK_PASSED=0
    CHECK_FAILED=0
    CHECK_WARNED=0
}

function count_pass() {
    ((CHECK_PASSED++)) || true
}

function count_fail() {
    ((CHECK_FAILED++)) || true
}

function count_warn() {
    ((CHECK_WARNED++)) || true
}

function print_summary() {
    echo ""
    echo "=========================================="
    echo -e "📊 Summary: ${GREEN}$CHECK_PASSED passed${NC}, ${RED}$CHECK_FAILED failed${NC}, ${YELLOW}$CHECK_WARNED warnings${NC}"
    echo "=========================================="
}
