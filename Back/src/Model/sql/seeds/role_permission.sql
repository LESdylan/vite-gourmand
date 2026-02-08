-- ============================================
-- SEED: RolePermission mapping
-- Admin gets everything, employee gets subset
-- ============================================

-- superadmin (1) gets all permissions
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT 1, "id" FROM "Permission"
ON CONFLICT DO NOTHING;

-- admin (2) gets all except superadmin-only
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT 2, "id" FROM "Permission" WHERE "name" != 'manage_users'
ON CONFLICT DO NOTHING;

-- employee (3)
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT 3, "id" FROM "Permission" WHERE "name" IN (
    'manage_menus','manage_dishes','manage_orders','view_all_orders',
    'update_order','moderate_reviews','manage_hours'
) ON CONFLICT DO NOTHING;

-- utilisateur (4)
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT 4, "id" FROM "Permission" WHERE "name" IN (
    'place_order','view_own_orders','write_review'
) ON CONFLICT DO NOTHING;

-- Admin: all permissions
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "Role" r, "Permission" p
WHERE r."name" = 'admin'
ON CONFLICT DO NOTHING;

-- Employee: menus, orders, reviews (no users, no analytics)
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "Role" r, "Permission" p
WHERE r."name" = 'employee'
  AND p."name" IN (
      'create_menus', 'read_menus', 'update_menus', 'delete_menus',
      'read_orders', 'update_orders',
      'read_reviews', 'update_reviews',
      'update_settings'
  )
ON CONFLICT DO NOTHING;

-- Utilisateur: read menus only (order placement handled by backend)
INSERT INTO "RolePermission" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "Role" r, "Permission" p
WHERE r."name" = 'utilisateur'
  AND p."name" IN ('read_menus')
ON CONFLICT DO NOTHING;
