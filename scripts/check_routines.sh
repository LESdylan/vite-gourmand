#!/bin/bash
# ==========================================
# Backend Routines Check
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

function check_routines() {
    log_section "BACKEND ROUTINES DIAGNOSTIC"
    print_header "🔍 BACKEND ROUTINES DIAGNOSTIC"
    reset_counters
    
    local all_ok=true

    # 1. Authentication Routine
    echo ""
    echo "1️⃣  Authentication Routine"
    log_subsection "1. Authentication Routine"
    
    check_file_exists "$BACKEND_PATH/src/auth/auth.module.ts" "AuthModule" && count_pass || { count_fail; all_ok=false; }
    
    if check_file_exists "$BACKEND_PATH/src/auth/auth.service.ts" "AuthService"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "Checking bcrypt usage..."
            if grep -q "bcrypt" "$BACKEND_PATH/src/auth/auth.service.ts"; then
                log_pass "bcrypt import found"
                grep -n "bcrypt" "$BACKEND_PATH/src/auth/auth.service.ts" | while IFS= read -r line; do
                    log_code "$line"
                done
            else
                log_warn "bcrypt not used in AuthService"
            fi
        fi
    else
        count_fail
        all_ok=false
    fi
    
    check_file_exists "$BACKEND_PATH/src/auth/auth.controller.ts" "AuthController" && count_pass || { count_fail; all_ok=false; }
    
    # Check JWT strategy
    if check_file_exists "$BACKEND_PATH/src/auth/strategies/jwt.strategy.ts" "JwtStrategy"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "JWT Strategy implementation:"
            log_file_content "$BACKEND_PATH/src/auth/strategies/jwt.strategy.ts" 30
        fi
    else
        count_fail
        all_ok=false
    fi
    
    # Check DTOs
    check_file_exists "$BACKEND_PATH/src/auth/dto/login.dto.ts" "LoginDTO" && count_pass || { count_fail; all_ok=false; }
    check_file_exists "$BACKEND_PATH/src/auth/dto/register.dto.ts" "RegisterDTO" && count_pass || { count_fail; all_ok=false; }

    # 2. Guard Routine
    echo ""
    echo "2️⃣  Guard Routine (JWT + Roles)"
    log_subsection "2. Guard Routine"
    
    if check_file_exists "$BACKEND_PATH/src/common/guards/jwt-auth.guard.ts" "JwtAuthGuard"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "JwtAuthGuard implementation:"
            log_file_content "$BACKEND_PATH/src/common/guards/jwt-auth.guard.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    if check_file_exists "$BACKEND_PATH/src/common/guards/roles.guard.ts" "RolesGuard"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_detail "RolesGuard implementation:"
            log_file_content "$BACKEND_PATH/src/common/guards/roles.guard.ts"
        fi
    else
        count_fail
        all_ok=false
    fi

    # 3. Validation Routine
    echo ""
    echo "3️⃣  Validation Routine"
    log_subsection "3. Validation Routine"
    
    if check_file_exists "$BACKEND_PATH/src/common/pipes/validation.pipe.ts" "CustomValidationPipe"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/pipes/validation.pipe.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    check_package_installed "class-validator" && count_pass || { count_fail; all_ok=false; }
    check_package_installed "class-transformer" && count_pass || { count_fail; all_ok=false; }

    # 4. Error Handling Routine
    echo ""
    echo "4️⃣  Error Handling Routine"
    log_subsection "4. Error Handling Routine"
    
    if check_file_exists "$BACKEND_PATH/src/common/filters/http-exception.filter.ts" "HttpExceptionFilter"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/filters/http-exception.filter.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    if check_file_exists "$BACKEND_PATH/src/common/filters/all-exceptions.filter.ts" "AllExceptionsFilter"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/filters/all-exceptions.filter.ts"
            if grep -q "INTERNAL_ERROR\|Internal server error" "$BACKEND_PATH/src/common/filters/all-exceptions.filter.ts"; then
                log_pass "Internal errors are masked from clients"
            fi
        fi
    else
        count_fail
        all_ok=false
    fi

    # 5. Interceptors Routine
    echo ""
    echo "5️⃣  Logging & Transform Routine"
    log_subsection "5. Interceptors Routine"
    
    if check_file_exists "$BACKEND_PATH/src/common/interceptors/logging.interceptor.ts" "LoggingInterceptor"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/interceptors/logging.interceptor.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    if check_file_exists "$BACKEND_PATH/src/common/interceptors/transform.interceptor.ts" "TransformInterceptor"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/interceptors/transform.interceptor.ts"
        fi
    else
        count_fail
        all_ok=false
    fi

    # 6. Decorator Routine
    echo ""
    echo "6️⃣  Decorator Routine"
    log_subsection "6. Custom Decorators"
    
    check_file_exists "$BACKEND_PATH/src/common/decorators/public.decorator.ts" "@Public() decorator" && count_pass || { count_fail; all_ok=false; }
    check_file_exists "$BACKEND_PATH/src/common/decorators/roles.decorator.ts" "@Roles() decorator" && count_pass || { count_fail; all_ok=false; }
    check_file_exists "$BACKEND_PATH/src/common/decorators/current-user.decorator.ts" "@CurrentUser() decorator" && count_pass || { count_fail; all_ok=false; }

    # 7. Environment Routine
    echo ""
    echo "7️⃣  Environment Routine"
    log_subsection "7. Environment Configuration"
    
    if check_file_exists "$BACKEND_PATH/.env" ".env file"; then
        count_pass
        
        if grep -q "DATABASE_URL" "$BACKEND_PATH/.env" 2>/dev/null; then
            print_ok "DATABASE_URL configured"
            log_pass "DATABASE_URL configured"
            count_pass
        else
            print_error "DATABASE_URL missing"
            log_fail "DATABASE_URL missing"
            count_fail
            all_ok=false
        fi
        
        if grep -q "JWT_SECRET" "$BACKEND_PATH/.env" 2>/dev/null; then
            print_ok "JWT_SECRET configured"
            log_pass "JWT_SECRET configured"
            count_pass
            if [[ "$VERBOSE" == "true" ]]; then
                jwt_len=$(grep "JWT_SECRET" "$BACKEND_PATH/.env" | cut -d'=' -f2 | wc -c)
                log_detail "JWT_SECRET length: $jwt_len characters"
                if [[ $jwt_len -lt 32 ]]; then
                    log_warn "JWT_SECRET should be at least 32 characters"
                fi
            fi
        else
            print_error "JWT_SECRET missing"
            log_fail "JWT_SECRET missing"
            count_fail
            all_ok=false
        fi
        
        if grep -q "MONGODB_URI" "$BACKEND_PATH/.env" 2>/dev/null; then
            print_ok "MONGODB_URI configured"
            log_pass "MONGODB_URI configured"
            count_pass
        else
            print_warn "MONGODB_URI missing (optional)"
            log_warn "MONGODB_URI missing"
            count_warn
        fi
    else
        count_fail
        all_ok=false
    fi
    
    check_package_installed "@nestjs/config" && count_pass || { count_fail; all_ok=false; }

    # 8. Database Access Routine
    echo ""
    echo "8️⃣  Database Access Routine"
    log_subsection "8. Prisma ORM"
    
    check_file_exists "$BACKEND_PATH/src/prisma/prisma.module.ts" "PrismaModule" && count_pass || { count_fail; all_ok=false; }
    
    if check_file_exists "$BACKEND_PATH/src/prisma/prisma.service.ts" "PrismaService"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/prisma/prisma.service.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    check_file_exists "$BACKEND_PATH/prisma/schema.prisma" "Prisma Schema" && count_pass || { count_fail; all_ok=false; }

    # 9. API Response Routine
    echo ""
    echo "9️⃣  API Response Routine"
    log_subsection "9. API Response Standardization"
    
    if check_file_exists "$BACKEND_PATH/src/common/dto/api-response.dto.ts" "ApiResponse DTO"; then
        count_pass
        if [[ "$VERBOSE" == "true" ]]; then
            log_file_content "$BACKEND_PATH/src/common/dto/api-response.dto.ts"
        fi
    else
        count_fail
        all_ok=false
    fi
    
    check_file_exists "$BACKEND_PATH/src/common/constants/index.ts" "Constants file" && count_pass || { count_fail; all_ok=false; }

    # 10. Global Registration Check
    echo ""
    echo "🔟 Global Registration Check"
    log_subsection "10. AppModule Global Registration"
    
    if [[ "$VERBOSE" == "true" ]]; then
        log_detail "AppModule providers section:"
        grep -A 50 "providers:" "$BACKEND_PATH/src/app.module.ts" | head -60 | while IFS= read -r line; do
            log_code "$line"
        done
    fi
    
    check_grep_in_file "APP_GUARD" "$BACKEND_PATH/src/app.module.ts" "Guards registered globally" "Guards not registered globally" && count_pass || { count_fail; all_ok=false; }
    check_grep_in_file "APP_FILTER" "$BACKEND_PATH/src/app.module.ts" "Filters registered globally" "Filters not registered globally" && count_pass || { count_fail; all_ok=false; }
    check_grep_in_file "APP_INTERCEPTOR" "$BACKEND_PATH/src/app.module.ts" "Interceptors registered globally" "Interceptors not registered globally" && count_pass || { count_fail; all_ok=false; }
    check_grep_in_file "APP_PIPE" "$BACKEND_PATH/src/app.module.ts" "Pipes registered globally" "Pipes not registered globally" && count_pass || { count_fail; all_ok=false; }

    # Summary
    print_summary
    
    if $all_ok; then
        echo ""
        print_ok "ALL ROUTINES CONFIGURED CORRECTLY! 🎉"
        log_pass "ALL ROUTINES CONFIGURED CORRECTLY!"
    else
        echo ""
        print_error "Some routines are missing or misconfigured"
        log_fail "Some routines are missing or misconfigured"
    fi
    
    log_end_section
    print_verbose
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_routines
fi
