-- ============================================
-- CACHE & DASHBOARD QUERIES
-- ============================================

-- Quick dashboard stats from materialized view
SELECT * FROM "mv_orders_by_status";

-- Monthly revenue trend
SELECT * FROM "mv_monthly_revenue" LIMIT 12;

-- Low stock alert
SELECT * FROM "v_low_stock_ingredients";

-- Active menus (cached view)
SELECT * FROM "v_active_menus";

-- Pending reviews count (quick badge)
SELECT COUNT(*) AS "pending_reviews" FROM "v_pending_reviews";

-- Upcoming deliveries this week
SELECT
    "delivery_date",
    COUNT(*) AS "orders",
    SUM("person_number") AS "total_persons"
FROM "Order"
WHERE "delivery_date" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND "status" NOT IN ('cancelled', 'completed')
GROUP BY "delivery_date"
ORDER BY "delivery_date";
