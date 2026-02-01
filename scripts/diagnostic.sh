#!/bin/bash
# ==========================================
# VITE GOURMAND DIAGNOSTIC TOOL
# ==========================================
# Modular diagnostic system for the Vite Gourmand project
# 
# Usage: ./diagnostic.sh [--v|--verbose] [command]
# Commands: load_db, mongo, routines, rgpd, rgaa, security, 
#           performance, quality, tests, docker, all, help
# ==========================================

shopt -s nocasematch

# Get script directory for sourcing modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source common library
source "$SCRIPT_DIR/lib/common.sh"

# Parse arguments
COMMAND=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --v|--verbose|-v)
            export VERBOSE="true"
            shift
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

# Initialize log if verbose
if [[ "$VERBOSE" == "true" ]]; then
    init_log
    echo -e "${CYAN}📝 Verbose mode enabled. Logging to: $LOG_FILE${NC}"
    echo ""
fi

# ==========================================
# COMMAND DISPATCH
# ==========================================

function load_check_script() {
    local script="$SCRIPT_DIR/$1"
    if [[ -f "$script" ]]; then
        source "$script"
        return 0
    else
        print_error "Check script not found: $script"
        return 1
    fi
}

function show_help() {
    echo ""
    echo "=========================================="
    echo "📋 DIAGNOSTIC COMMANDS"
    echo "=========================================="
    echo ""
    echo "  Database Checks:"
    echo "    load_db     - Check PostgreSQL status, tables, and data"
    echo "    mongo       - Check MongoDB status and collections"
    echo ""
    echo "  Compliance Checks:"
    echo "    routines    - Check backend routines (guards, filters, pipes)"
    echo "    rgpd        - Check RGPD/GDPR compliance"
    echo "    rgaa        - Check RGAA accessibility compliance"
    echo "    security    - Check security configuration"
    echo ""
    echo "  Quality Checks:"
    echo "    quality     - Check code quality (lint, tests, docs)"
    echo "    performance - Check performance optimizations"
    echo "    tests       - Run backend unit tests"
    echo ""
    echo "  Infrastructure:"
    echo "    docker      - Check Docker containers and infrastructure"
    echo ""
    echo "  Combined:"
    echo "    all         - Run all checks"
    echo "    full        - Run all checks including tests"
    echo ""
    echo "  Other:"
    echo "    help        - Show this help"
    echo "    exit/quit   - Exit diagnostic"
    echo ""
    echo "  Options:"
    echo "    --v, --verbose  Enable verbose logging to $LOG_FILE"
    echo ""
    echo "  Examples:"
    echo "    ./diagnostic.sh routines        # Check routines"
    echo "    ./diagnostic.sh --v all         # All checks with verbose logging"
    echo "    ./diagnostic.sh                 # Interactive mode"
    echo ""
}

function process_command() {
    local cmd="$1"
    case "$cmd" in
        load_db|loaddb|postgres|pg)
            load_check_script "check_load_db.sh" && check_load_db
            ;;
        mongo|mongodb)
            load_check_script "check_mongo.sh" && check_mongo
            ;;
        routines|routine)
            load_check_script "check_routines.sh" && check_routines
            ;;
        rgpd|gdpr)
            load_check_script "check_rgpd.sh" && check_rgpd
            ;;
        rgaa|a11y|accessibility)
            load_check_script "check_rgaa.sh" && check_rgaa
            ;;
        security|sec)
            load_check_script "check_security.sh" && check_security
            ;;
        performance|perf)
            load_check_script "check_performance.sh" && check_performance
            ;;
        quality|lint|code)
            load_check_script "check_code_quality.sh" && check_code_quality
            ;;
        tests|test)
            load_check_script "check_tests.sh" && check_tests
            ;;
        docker|containers|infra)
            load_check_script "check_docker.sh" && check_docker
            ;;
        all)
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "            RUNNING ALL DIAGNOSTIC CHECKS"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            load_check_script "check_docker.sh" && check_docker
            echo ""
            load_check_script "check_load_db.sh" && check_load_db
            echo ""
            load_check_script "check_mongo.sh" && check_mongo
            echo ""
            load_check_script "check_routines.sh" && check_routines
            echo ""
            load_check_script "check_rgpd.sh" && check_rgpd
            echo ""
            load_check_script "check_rgaa.sh" && check_rgaa
            echo ""
            load_check_script "check_security.sh" && check_security
            echo ""
            load_check_script "check_performance.sh" && check_performance
            echo ""
            load_check_script "check_code_quality.sh" && check_code_quality
            
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "            ALL DIAGNOSTIC CHECKS COMPLETE"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ;;
        full)
            process_command "all"
            echo ""
            load_check_script "check_tests.sh" && check_tests
            ;;
        help|h|\?)
            show_help
            ;;
        "")
            # Empty command, just continue
            ;;
        *)
            echo "Unknown command: $cmd"
            echo "Type 'help' for available commands"
            return 1
            ;;
    esac
}

# ==========================================
# MAIN
# ==========================================

echo ""
echo "=========================================="
echo "🔧 VITE GOURMAND DIAGNOSTIC TOOL"
echo "=========================================="

# If command provided as argument, run it and exit
if [[ -n "$COMMAND" ]]; then
    process_command "$COMMAND"
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📝 Verbose log saved to: $LOG_FILE"
        echo "   View with: cat $LOG_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    exit 0
fi

# Interactive REPL mode
echo "Type 'help' for available commands"
echo ""

while true; do
    read -rp "diag> " cmd
    case "$cmd" in
        exit|quit|q)
            echo "Exiting diagnostic REPL."
            if [[ "$VERBOSE" == "true" ]]; then
                echo "📝 Verbose log saved to: $LOG_FILE"
            fi
            break
            ;;
        *)
            process_command "$cmd"
            ;;
    esac
done
