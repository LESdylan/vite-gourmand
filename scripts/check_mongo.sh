#!/bin/bash
# ==========================================
# MongoDB Database Check
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

function check_mongo() {
    log_section "MONGODB DATABASE CHECK"
    print_header "🍃 MONGODB DATABASE CHECK"
    reset_counters
    
    echo "Checking MongoDB container status..."
    
    local status
    status=$(docker inspect -f '{{.State.Status}}' "$MONGO_CONTAINER" 2>/dev/null)
    log_detail "Container status: $status"
    
    if [[ "$status" != "running" ]]; then
        print_error "MongoDB container is not running"
        log_fail "MongoDB container is not running"
        count_fail
        log_end_section
        print_verbose
        return 1
    fi
    
    print_ok "MongoDB container is running"
    log_pass "MongoDB container is running"
    count_pass
    
    # Test connection
    echo ""
    echo "Testing MongoDB connection..."
    local ping_result
    ping_result=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin --eval "db.adminCommand('ping')" --quiet 2>&1)
    if echo "$ping_result" | grep -q "ok"; then
        print_ok "MongoDB connection successful"
        log_pass "MongoDB connection successful"
        count_pass
    else
        print_error "MongoDB connection failed"
        log_fail "MongoDB connection failed: $ping_result"
        count_fail
    fi
    
    # List collections
    echo ""
    echo "--- Collections in vite_gourmand: ---"
    log_subsection "Collections"
    local collections
    collections=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "db.getCollectionNames()" --quiet 2>&1)
    echo "$collections"
    log_code "$collections"
    
    # Collection counts
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Collection Document Counts"
        
        local expected_collections=("audit_logs" "menu_analytics" "user_sessions" "search_history" "performance_metrics" "error_logs")
        for coll in "${expected_collections[@]}"; do
            local count
            count=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "db.$coll.countDocuments()" --quiet 2>&1)
            log_detail "$coll: $count documents"
        done
    fi
    
    # Sample audit logs for RGPD traceability
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Sample Audit Logs (RGPD Traceability)"
        local audit_count
        audit_count=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "db.audit_logs.countDocuments()" --quiet 2>&1)
        log_detail "Total audit log entries: $audit_count"
        
        if [[ "$audit_count" != "0" ]] && [[ "$audit_count" =~ ^[0-9]+$ ]]; then
            log_pass "Audit logs are being recorded"
            local sample
            sample=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "JSON.stringify(db.audit_logs.findOne(), null, 2)" --quiet 2>&1)
            log_detail "Sample audit log entry:"
            while IFS= read -r line; do
                log_code "$line"
            done <<< "$sample"
        else
            log_warn "No audit logs yet - will be populated when API is used"
        fi
        
        log_subsection "Sample Analytics Data"
        local analytics_count
        analytics_count=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "db.menu_analytics.countDocuments()" --quiet 2>&1)
        log_detail "Total menu analytics entries: $analytics_count"
    fi
    
    # Check indexes
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Index Analysis"
        
        for coll in "audit_logs" "menu_analytics" "user_sessions"; do
            local indexes
            indexes=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "db.$coll.getIndexes().map(i => i.name).join(', ')" --quiet 2>&1)
            log_detail "$coll indexes: $indexes"
        done
    fi
    
    # Check database stats
    if [[ "$VERBOSE" == "true" ]]; then
        log_subsection "Database Statistics"
        local db_stats
        db_stats=$(docker exec "$MONGO_CONTAINER" mongosh -u root -p example --authenticationDatabase admin vite_gourmand --eval "JSON.stringify(db.stats(), null, 2)" --quiet 2>&1)
        log_detail "Database stats:"
        while IFS= read -r line; do
            log_code "$line"
        done <<< "$db_stats"
    fi
    
    print_summary
    log_end_section
    print_verbose
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_mongo
fi
