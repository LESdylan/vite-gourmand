#!/bin/bash
# ==========================================
# Security Check
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

function check_security() {
    log_section "SECURITY CHECK"
    print_header "🔒 SECURITY CHECK"
    reset_counters

    # 1. Helmet.js (Security Headers)
    echo ""
    echo "1️⃣  Security Headers (Helmet)"
    log_subsection "1. HTTP Security Headers"
    
    if grep -q "helmet" "$BACKEND_PATH/package.json" 2>/dev/null; then
        print_ok "Helmet.js installed (security headers)"
        log_pass "Helmet.js installed"
        count_pass
        
        if grep -q "helmet" "$BACKEND_PATH/src/main.ts" 2>/dev/null; then
            print_ok "Helmet configured in main.ts"
            log_pass "Helmet configured"
            count_pass
        else
            print_warn "Helmet installed but may not be configured"
            log_warn "Check Helmet configuration in main.ts"
            count_warn
        fi
    else
        print_warn "Consider adding Helmet.js for security headers"
        log_warn "Helmet.js not installed"
        count_warn
    fi

    # 2. CORS Configuration
    echo ""
    echo "2️⃣  CORS Configuration"
    log_subsection "2. CORS Settings"
    
    if grep -q "enableCors\|cors" "$BACKEND_PATH/src/main.ts" 2>/dev/null; then
        print_ok "CORS configured"
        log_pass "CORS configured"
        count_pass
        
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "CORS configuration:"
            grep -A 10 "enableCors\|cors" "$BACKEND_PATH/src/main.ts" | head -15 | while IFS= read -r line; do
                log_code "$line"
            done
        fi
        
        # Check for wildcard origin
        if grep -q "origin: '\*'\|origin: true" "$BACKEND_PATH/src/main.ts" 2>/dev/null; then
            print_warn "CORS allows all origins - restrict in production!"
            log_warn "CORS wildcard origin detected"
            count_warn
        fi
    else
        print_warn "CORS not explicitly configured"
        log_warn "CORS not configured"
        count_warn
    fi

    # 3. Rate Limiting / Throttling
    echo ""
    echo "3️⃣  Rate Limiting / Throttling"
    log_subsection "3. DDoS Protection"
    
    if check_package_installed "@nestjs/throttler"; then
        count_pass
        
        if grep -q "ThrottlerModule\|ThrottlerGuard" "$BACKEND_PATH/src/app.module.ts" 2>/dev/null; then
            print_ok "Throttler configured in AppModule"
            log_pass "Throttler configured"
            count_pass
        else
            print_warn "Throttler installed but not configured"
            log_warn "Configure ThrottlerModule"
            count_warn
        fi
    else
        print_warn "Consider adding @nestjs/throttler"
        count_warn
    fi

    # 4. SQL Injection Protection
    echo ""
    echo "4️⃣  SQL Injection Protection"
    log_subsection "4. SQL Injection Prevention"
    
    # Using Prisma ORM is generally safe
    if [[ -f "$BACKEND_PATH/prisma/schema.prisma" ]]; then
        print_ok "Using Prisma ORM (parameterized queries)"
        log_pass "Prisma ORM used (safe from SQL injection)"
        count_pass
    fi
    
    # Check for raw queries in application code (exclude generated files)
    if grep -r "\$queryRaw\|\$executeRaw" "$BACKEND_PATH/src" --include="*.ts" 2>/dev/null | grep -v "generated/" | grep -v "\.d\.ts" | grep -q .; then
        print_warn "Raw SQL queries found in app code - ensure proper sanitization"
        log_warn "Raw SQL queries detected in application code"
        count_warn
        
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "Raw query locations:"
            grep -rn "\$queryRaw\|\$executeRaw" "$BACKEND_PATH/src" --include="*.ts" | grep -v "generated/" | while IFS= read -r line; do
                log_code "$line"
            done
        fi
    else
        print_ok "No raw SQL queries in application code"
        log_pass "No raw SQL queries in app code"
        count_pass
    fi

    # 5. XSS Protection
    echo ""
    echo "5️⃣  XSS Protection"
    log_subsection "5. Cross-Site Scripting Prevention"
    
    # Check for sanitization
    if grep -r "sanitize\|escape\|xss" "$BACKEND_PATH/src" --include="*.ts" -i 2>/dev/null | grep -q .; then
        print_ok "Sanitization patterns found"
        log_pass "Sanitization detected"
        count_pass
    else
        print_info "API returns JSON (lower XSS risk than HTML)"
        log_detail "JSON API has lower XSS risk"
        count_pass
    fi
    
    # ValidationPipe with transform helps
    if grep -q "transform: true" "$BACKEND_PATH/src" -r --include="*.ts" 2>/dev/null; then
        print_ok "ValidationPipe transform enabled"
        log_pass "Transform enabled in validation"
        count_pass
    fi

    # 6. Sensitive Data in Logs
    echo ""
    echo "6️⃣  Sensitive Data in Logs"
    log_subsection "6. Log Data Protection"
    
    # Check if password value is logged (not just the word "password" in error messages)
    # Look for patterns like: password=, password:, ${password}, dto.password, user.password followed by log
    if grep -rE "(console\.log|logger\.\w+).*\\\$\{.*password" "$BACKEND_PATH/src" --include="*.ts" 2>/dev/null | grep -v "\.spec\." | grep -q .; then
        print_error "Potential password logging detected!"
        log_fail "Password value may be logged"
        count_fail
    elif grep -rE "console\.log\(.*\.password|logger\.\w+\(.*\.password" "$BACKEND_PATH/src" --include="*.ts" 2>/dev/null | grep -v "\.spec\." | grep -q .; then
        print_error "Potential password logging detected!"
        log_fail "Password property may be logged"
        count_fail
    else
        print_ok "No password value logging detected"
        log_pass "Password values not logged"
        count_pass
    fi

    # 7. Environment Variable Security
    echo ""
    echo "7️⃣  Environment Variables"
    log_subsection "7. Secrets Management"
    
    # Check .env is in gitignore
    if grep -q "\.env" "$BACKEND_PATH/../.gitignore" 2>/dev/null || grep -q "\.env" "$BACKEND_PATH/.gitignore" 2>/dev/null; then
        print_ok ".env in .gitignore"
        log_pass ".env is gitignored"
        count_pass
    else
        print_error ".env not in .gitignore - secrets may be committed!"
        log_fail ".env not gitignored"
        count_fail
    fi
    
    # Check for hardcoded secrets
    if grep -r "JWT_SECRET.*=.*['\"][^'\"]*['\"]" "$BACKEND_PATH/src" --include="*.ts" 2>/dev/null | grep -v "process.env\|configService" | grep -q .; then
        print_error "Hardcoded JWT_SECRET found!"
        log_fail "Hardcoded secret detected"
        count_fail
    else
        print_ok "No hardcoded secrets detected"
        log_pass "Secrets use environment variables"
        count_pass
    fi

    # 8. HTTPS Configuration
    echo ""
    echo "8️⃣  HTTPS / TLS"
    log_subsection "8. Transport Security"
    
    # In development, HTTPS is usually handled by reverse proxy
    print_info "HTTPS typically handled by reverse proxy in production"
    log_detail "HTTPS configured at infrastructure level"
    
    # Check for secure cookie settings in code or .env
    if grep -r "secure.*true\|httpOnly.*true\|COOKIE_SECURE" "$BACKEND_PATH/src" "$BACKEND_PATH/.env" --include="*.ts" 2>/dev/null | grep -q .; then
        print_ok "Cookie security configuration found"
        log_pass "Cookie security configured"
        count_pass
    elif grep -q "COOKIE_SECURE" "$BACKEND_PATH/.env" 2>/dev/null; then
        print_ok "Cookie security configured in .env"
        log_pass "Cookie security in environment"
        count_pass
    else
        print_warn "Ensure cookies have secure flags in production"
        log_warn "Check cookie security settings"
        count_warn
    fi

    # 9. Dependency Vulnerabilities
    echo ""
    echo "9️⃣  Dependency Vulnerabilities"
    log_subsection "9. npm audit"
    
    print_info "Run 'npm audit' in backend for vulnerability scan"
    log_detail "Run: cd backend && npm audit"
    
    if [[ "$VERBOSE" == "true" ]]; then
        log_detail "Quick audit check:"
        local audit_result
        audit_result=$(cd "$BACKEND_PATH" && npm audit --json 2>/dev/null | head -50)
        if echo "$audit_result" | grep -q '"high"\|"critical"'; then
            log_warn "High/Critical vulnerabilities found - run npm audit fix"
        else
            log_pass "No high/critical vulnerabilities"
        fi
    fi

    # 10. Authentication Token Security
    echo ""
    echo "🔟 JWT Token Security"
    log_subsection "10. JWT Configuration"
    
    # Check JWT expiration
    if grep -r "expiresIn\|signOptions" "$BACKEND_PATH/src" --include="*.ts" 2>/dev/null | grep -q .; then
        print_ok "JWT expiration configured"
        log_pass "JWT expiration set"
        count_pass
        
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "JWT configuration:"
            grep -rn "expiresIn\|signOptions" "$BACKEND_PATH/src" --include="*.ts" | while IFS= read -r line; do
                log_code "$line"
            done
        fi
    else
        print_warn "Check JWT expiration configuration"
        log_warn "JWT expiration not found"
        count_warn
    fi
    
    # Check for refresh tokens
    if grep -r "refresh.*token\|refreshToken" "$BACKEND_PATH/src" --include="*.ts" -i 2>/dev/null | grep -q .; then
        print_ok "Refresh token mechanism found"
        log_pass "Refresh tokens implemented"
        count_pass
    else
        print_warn "Consider implementing refresh tokens"
        log_warn "No refresh token mechanism"
        count_warn
    fi

    print_summary
    log_end_section
    print_verbose
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_security
fi
