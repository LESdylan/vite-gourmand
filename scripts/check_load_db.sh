#!/bin/bash
# ==========================================
# PostgreSQL Database Check
# ==========================================
# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

function check_load_db() {
    log_section "POSTGRESQL DATABASE CHECK"
    print_header "🐘 POSTGRESQL DATABASE CHECK"
    reset_counters
    
    echo "Checking PostgreSQL container status..."
    
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null)
    log_detail "Container status: $status"
    
    if [[ "$status" != "running" ]]; then
        print_error "PostgreSQL container is not running"
        log_fail "PostgreSQL container is not running"
        count_fail
        log_end_section
        print_verbose
        return 1
    fi
    
    local health
    health=$(docker inspect -f '{{.State.Health.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null)
    log_detail "Health status: $health"
    
    if [[ "$health" == "healthy" ]]; then
        print_ok "PostgreSQL container is running and healthy"
        log_pass "PostgreSQL container is running and healthy"
        count_pass
    else
        print_warn "PostgreSQL container is running but not healthy: $health"
        log_warn "PostgreSQL container not healthy: $health"
        count_warn
    fi
    
    # List databases
    echo ""
    echo "--- Databases: ---"
    log_subsection "Databases"
    local db_list
    db_list=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate = false;" 2>&1)
    echo "$db_list"
    log_code "$db_list"
    
    # List tables
    echo ""
    echo "--- Tables in vite_gourmand: ---"
    log_subsection "Tables in vite_gourmand"
    local table_list
    table_list=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -c "\dt" 2>&1)
    echo "$table_list"
    while IFS= read -r line; do
        log_code "$line"
    done <<< "$table_list"
    
    # Table counts
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Table Row Counts"
        local tables=("User" "Role" "Menu" "Dish" "Order" "Allergen" "Diet" "Theme")
        for table in "${tables[@]}"; do
            local count
            count=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -tAc "SELECT COUNT(*) FROM \"$table\";" 2>&1)
            log_detail "$table: $count rows"
        done
    fi
    
    # Sample user data for password verification
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Sample User Data (Password Hashing Verification)"
        local user_data
        user_data=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -c "SELECT id, email, LEFT(password, 35) || '...' as password_preview FROM \"User\" LIMIT 5;" 2>&1)
        while IFS= read -r line; do
            log_code "$line"
        done <<< "$user_data"
        
        if echo "$user_data" | grep -q '\$2[aby]\$'; then
            log_pass "Passwords are bcrypt hashed (starts with \$2a\$, \$2b\$, or \$2y\$)"
            print_ok "Passwords are properly bcrypt hashed"
            count_pass
        elif echo "$user_data" | grep -q "0 rows"; then
            log_warn "No users in database yet - cannot verify hashing"
            print_warn "No users in database - run 'make seed_db_playground'"
            count_warn
        else
            log_fail "Passwords may NOT be hashed correctly!"
            print_error "Passwords may not be properly hashed"
            count_fail
        fi
    fi
    
    # Check for orphan records
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Data Integrity Checks"
        
        # Users without roles
        local orphan_users
        orphan_users=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -tAc "SELECT COUNT(*) FROM \"User\" WHERE \"roleId\" IS NULL;" 2>&1)
        if [[ "$orphan_users" -gt 0 ]]; then
            log_warn "Found $orphan_users users without assigned roles"
        else
            log_pass "All users have assigned roles"
        fi
        
        # Orders without users
        local orphan_orders
        orphan_orders=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -tAc "SELECT COUNT(*) FROM \"Order\" o LEFT JOIN \"User\" u ON o.\"userId\" = u.id WHERE u.id IS NULL;" 2>&1)
        if [[ "$orphan_orders" -gt 0 ]]; then
            log_warn "Found $orphan_orders orders with missing user references"
        else
            log_pass "All orders have valid user references"
        fi
    fi
    
    # Check database size
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Database Statistics"
        local db_size
        db_size=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -tAc "SELECT pg_size_pretty(pg_database_size('vite_gourmand'));" 2>&1)
        log_detail "Database size: $db_size"
        
        local connection_count
        connection_count=$(docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -tAc "SELECT count(*) FROM pg_stat_activity WHERE datname = 'vite_gourmand';" 2>&1)
        log_detail "Active connections: $connection_count"
    fi
    
    print_summary
    log_end_section
    print_verbose
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_load_db
fi
