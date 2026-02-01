#!/bin/bash
# ==========================================
# Run Backend Tests
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

function check_tests() {
    log_section "BACKEND TESTS"
    print_header "🧪 BACKEND TESTS"
    reset_counters

    # Check if dependencies are installed
    if [[ ! -d "$BACKEND_PATH/node_modules" ]]; then
        print_error "Backend dependencies not installed"
        log_fail "node_modules not found"
        print_info "Run 'make install-backend' first"
        return 1
    fi

    # 1. Unit Tests
    echo ""
    echo "1️⃣  Running Unit Tests"
    log_subsection "1. Unit Tests"
    
    local test_output
    test_output=$(cd "$BACKEND_PATH" && npm run test 2>&1)
    local test_exit_code=$?
    
    # Show summary
    echo "$test_output" | tail -20
    
    if [[ "$VERBOSE" == "true" ]]; then
        log_detail "Full test output:"
        while IFS= read -r line; do
            log_code "$line"
        done <<< "$test_output"
    fi
    
    # Count results
    local passed
    passed=$(echo "$test_output" | grep -o "[0-9]* passed" | grep -o "[0-9]*" || echo "0")
    local failed
    failed=$(echo "$test_output" | grep -o "[0-9]* failed" | grep -o "[0-9]*" || echo "0")
    
    if [[ $test_exit_code -eq 0 ]]; then
        print_ok "All unit tests passed! ($passed tests)"
        log_pass "Unit tests passed: $passed"
        count_pass
    else
        print_error "Some unit tests failed ($failed failed, $passed passed)"
        log_fail "Unit tests failed: $failed"
        count_fail
    fi

    # 2. E2E Tests (if available)
    echo ""
    echo "2️⃣  E2E Tests"
    log_subsection "2. E2E Tests"
    
    if [[ -d "$BACKEND_PATH/test" ]] && ls "$BACKEND_PATH/test"/*.e2e-spec.ts 1>/dev/null 2>&1; then
        print_info "E2E tests available (run with 'npm run test:e2e')"
        log_detail "E2E tests available in $BACKEND_PATH/test"
        
        local e2e_files
        e2e_files=$(ls "$BACKEND_PATH/test"/*.e2e-spec.ts 2>/dev/null | wc -l)
        print_info "Found $e2e_files E2E test files"
        log_detail "E2E test files: $e2e_files"
        
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "E2E test files:"
            ls "$BACKEND_PATH/test"/*.e2e-spec.ts | while IFS= read -r file; do
                log_code "  $(basename "$file")"
            done
        fi
    else
        print_warn "No E2E tests found"
        log_warn "No E2E tests"
        count_warn
    fi

    # 3. Test Coverage
    echo ""
    echo "3️⃣  Test Coverage"
    log_subsection "3. Coverage"
    
    if grep -q "test:cov" "$BACKEND_PATH/package.json" 2>/dev/null; then
        print_ok "Coverage script available (npm run test:cov)"
        log_pass "Coverage script exists"
        count_pass
        
        if [[ "$VERBOSE" == "true" ]]; then
            print_info "Running coverage analysis..."
            local cov_output
            cov_output=$(cd "$BACKEND_PATH" && npm run test:cov 2>&1 | tail -30)
            log_detail "Coverage output:"
            while IFS= read -r line; do
                log_code "$line"
            done <<< "$cov_output"
        fi
    else
        print_warn "No coverage script found"
        log_warn "No coverage script"
        count_warn
    fi

    # 4. Lint Check
    echo ""
    echo "4️⃣  Lint Check"
    log_subsection "4. ESLint"
    
    if grep -q "\"lint\"" "$BACKEND_PATH/package.json" 2>/dev/null; then
        local lint_output
        lint_output=$(cd "$BACKEND_PATH" && npm run lint 2>&1)
        local lint_exit_code=$?
        
        if [[ $lint_exit_code -eq 0 ]]; then
            print_ok "No linting errors"
            log_pass "Lint check passed"
            count_pass
        else
            print_warn "Linting issues found"
            log_warn "Lint issues detected"
            count_warn
            
            if [[ "$VERBOSE" == "true" ]]; then
                log_detail "Lint output:"
                while IFS= read -r line; do
                    log_code "$line"
                done <<< "$lint_output"
            fi
        fi
    else
        print_warn "No lint script found"
        log_warn "No lint script"
        count_warn
    fi

    # 5. TypeScript Compilation
    echo ""
    echo "5️⃣  TypeScript Compilation"
    log_subsection "5. TypeScript Build"
    
    local tsc_output
    tsc_output=$(cd "$BACKEND_PATH" && npx tsc --noEmit 2>&1)
    local tsc_exit_code=$?
    
    if [[ $tsc_exit_code -eq 0 ]]; then
        print_ok "TypeScript compiles without errors"
        log_pass "TypeScript compilation clean"
        count_pass
    else
        print_error "TypeScript compilation errors"
        log_fail "TypeScript errors found"
        count_fail
        
        # Show first few errors
        echo "$tsc_output" | head -20
        
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "TypeScript errors:"
            while IFS= read -r line; do
                log_code "$line"
            done <<< "$tsc_output"
        fi
    fi

    print_summary
    log_end_section
    print_verbose
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_tests
fi
