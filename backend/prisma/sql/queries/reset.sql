-- ============================================
-- MASTER PUSH SCRIPT — Supabase / PostgreSQL
-- ============================================
-- Execution order matters (FK dependencies).
--
-- Run with:
--   psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" -f reset.sql
--
-- Or execute each file individually in order:
--   1. \i ../sql/schemas/reset.sql
--   2. \i ../sql/schemas/orgnanization.sql
--   3. \i ../sql/schemas/auth.sql
--   4. \i ../sql/schemas/gpdr.sql
--   5. \i ../sql/schemas/menu.sql
--   6. \i ../sql/schemas/orders.sql
--   7. \i ../sql/schemas/reviews.sql
--   8. \i ../sql/schemas/contact.sql
--   9. \i ../sql/schemas/loyalty.sql
--  10. \i ../sql/schemas/employee.sql
--  11. \i ../sql/schemas/messaging.sql
--  12. \i ../sql/schemas/kanban.sql
--  13. \i ../sql/schemas/optimizing.sql
--  14. \i ../sql/schemas/cache.sql
--  15. \i ../sql/seeds/role.sql
--  16. \i ../sql/seeds/permission.sql
--  17. \i ../sql/seeds/role_permission.sql
--  18. \i ../sql/seeds/user.sql
--  19. \i ../sql/seeds/user_address.sql
--  20. \i ../sql/seeds/user_session.sql
--  21. \i ../sql/seeds/user_content.sql
--  22. \i ../sql/seeds/password_token.sql
--  23. \i ../sql/seeds/working_hours.sql
--  24. \i ../sql/seeds/diet.sql
--  25. \i ../sql/seeds/theme.sql
--  26. \i ../sql/seeds/allergen.sql
--  27. \i ../sql/seeds/ingredient.sql
--  28. \i ../sql/seeds/menu.sql
--  29. \i ../sql/seeds/dish.sql
--  30. \i ../sql/seeds/menu_dish.sql
--  31. \i ../sql/seeds/menu_image.sql
--  32. \i ../sql/seeds/dish_allergen.sql
--  33. \i ../sql/seeds/dish_ingredient.sql
--  34. \i ../sql/seeds/menu_ingredient.sql
--  35. \i ../sql/seeds/order.sql
--  36. \i ../sql/seeds/order_status_history.sql
--  37. \i ../sql/seeds/publish.sql
--  38. \i ../sql/seeds/contact_message.sql
--  39. \i ../sql/seeds/data_deletion_request.sql
--  40. \i ../sql/seeds/loyalty_account.sql
--  41. \i ../sql/seeds/loyalty_transaction.sql
--  42. \i ../sql/seeds/discount.sql
--  43. \i ../sql/seeds/time_off_request.sql
--  44. \i ../sql/seeds/message.sql
--  45. \i ../sql/seeds/notification.sql
--  46. \i ../sql/seeds/support_ticket.sql
--  47. \i ../sql/seeds/ticket_message.sql
--  48. \i ../sql/seeds/kanban_column.sql
--  49. \i ../sql/seeds/order_tag.sql
--  50. \i ../sql/seeds/order_order_tag.sql
-- ============================================

\echo '🔴 Dropping all tables...'
\i ../sql/schemas/reset.sql

\echo '🏢 Creating company tables...'
\i ../sql/schemas/orgnanization.sql

\echo '🔐 Creating auth tables...'
\i ../sql/schemas/auth.sql

\echo '🛡️ Creating GDPR tables...'
\i ../sql/schemas/gpdr.sql

\echo '📋 Creating menu tables...'
\i ../sql/schemas/menu.sql

\echo '📦 Creating order tables...'
\i ../sql/schemas/orders.sql

\echo '⭐ Creating review tables...'
\i ../sql/schemas/reviews.sql

\echo '📬 Creating contact tables...'
\i ../sql/schemas/contact.sql

\echo '🎁 Creating loyalty tables...'
\i ../sql/schemas/loyalty.sql

\echo '👷 Creating employee tables...'
\i ../sql/schemas/employee.sql

\echo '💬 Creating messaging tables...'
\i ../sql/schemas/messaging.sql

\echo '📊 Creating kanban tables...'
\i ../sql/schemas/kanban.sql

\echo '⚡ Creating triggers & views...'
\i ../sql/schemas/optimizing.sql

\echo '📈 Creating materialized views...'
\i ../sql/schemas/cache.sql

\echo ''
\echo '🌱 Seeding data...'
\i ../sql/seeds/role.sql
\i ../sql/seeds/permission.sql
\i ../sql/seeds/role_permission.sql
\i ../sql/seeds/user.sql
\i ../sql/seeds/user_address.sql
\i ../sql/seeds/user_session.sql
\i ../sql/seeds/user_content.sql
\i ../sql/seeds/password_token.sql
\i ../sql/seeds/working_hours.sql
\i ../sql/seeds/diet.sql
\i ../sql/seeds/theme.sql
\i ../sql/seeds/allergen.sql
\i ../sql/seeds/ingredient.sql
\i ../sql/seeds/menu.sql
\i ../sql/seeds/dish.sql
\i ../sql/seeds/menu_dish.sql
\i ../sql/seeds/menu_image.sql
\i ../sql/seeds/dish_allergen.sql
\i ../sql/seeds/dish_ingredient.sql
\i ../sql/seeds/menu_ingredient.sql
\i ../sql/seeds/order.sql
\i ../sql/seeds/order_status_history.sql
\i ../sql/seeds/publish.sql
\i ../sql/seeds/contact_message.sql
\i ../sql/seeds/data_deletion_request.sql
\i ../sql/seeds/loyalty_account.sql
\i ../sql/seeds/loyalty_transaction.sql
\i ../sql/seeds/discount.sql
\i ../sql/seeds/time_off_request.sql
\i ../sql/seeds/message.sql
\i ../sql/seeds/notification.sql
\i ../sql/seeds/support_ticket.sql
\i ../sql/seeds/ticket_message.sql
\i ../sql/seeds/kanban_column.sql
\i ../sql/seeds/order_tag.sql
\i ../sql/seeds/order_order_tag.sql

\echo ''
\echo '🔄 Refreshing materialized views...'
REFRESH MATERIALIZED VIEW "mv_orders_by_status";
REFRESH MATERIALIZED VIEW "mv_monthly_revenue";

\echo ''
\echo '✅ DATABASE FULLY SEEDED!'
\echo '   Tables: 36'
\echo '   Test password: Test123!'
\echo '   Admin: jose@vitegourmand.fr'
\echo ''
