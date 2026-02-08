-- ============================================
-- OPTIMIZATION & MAINTENANCE QUERIES
-- ============================================

-- Refresh materialized views (run via cron)
REFRESH MATERIALIZED VIEW "mv_orders_by_status";
REFRESH MATERIALIZED VIEW "mv_monthly_revenue";

-- Check index usage
SELECT
    schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find slow queries (if pg_stat_statements is enabled)
-- SELECT query, calls, mean_exec_time, total_exec_time
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time DESC
-- LIMIT 10;

-- Check table sizes
SELECT
    relname AS "table",
    pg_size_pretty(pg_total_relation_size(relid)) AS "total_size",
    pg_size_pretty(pg_relation_size(relid)) AS "data_size",
    n_live_tup AS "row_count"
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Vacuum analyze (maintenance)
-- VACUUM ANALYZE "Order";
-- VACUUM ANALYZE "User";
-- VACUUM ANALYZE "Menu";

-- Check for dead tuples needing vacuum
SELECT
    relname, n_dead_tup, n_live_tup,
    ROUND(n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0) * 100, 2) AS "dead_pct"
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
