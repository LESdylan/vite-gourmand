-- ============================================
-- MATERIALIZED VIEWS & CACHE HELPERS
-- ============================================
-- Pre-computed data for dashboard performance.
-- Refresh periodically via cron / application scheduler.
-- ============================================

-- Orders per status (admin dashboard widget)
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_orders_by_status" AS
SELECT
    "status",
    COUNT(*)           AS "count",
    SUM("total_price") AS "total_revenue"
FROM "Order"
GROUP BY "status";

-- Revenue by month
CREATE MATERIALIZED VIEW IF NOT EXISTS "mv_monthly_revenue" AS
SELECT
    DATE_TRUNC('month', "order_date") AS "month",
    COUNT(*)                          AS "order_count",
    SUM("total_price")                AS "revenue",
    AVG("total_price")                AS "avg_order_value"
FROM "Order"
WHERE "status" IN ('completed', 'delivered')
GROUP BY DATE_TRUNC('month', "order_date")
ORDER BY "month" DESC;

-- Low stock ingredients
CREATE OR REPLACE VIEW "v_low_stock_ingredients" AS
SELECT
    "id",
    "name",
    "unit",
    "current_stock",
    "min_stock_level",
    ROUND(("current_stock" / NULLIF("min_stock_level", 0)) * 100, 1) AS "stock_percent"
FROM "Ingredient"
WHERE "current_stock" <= "min_stock_level"
ORDER BY "current_stock" ASC;

-- To refresh materialized views:
-- REFRESH MATERIALIZED VIEW "mv_orders_by_status";
-- REFRESH MATERIALIZED VIEW "mv_monthly_revenue";
