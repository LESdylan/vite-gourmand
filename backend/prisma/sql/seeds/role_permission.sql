-- ============================================
-- SEED: RolePermission mapping
-- Admin gets everything, employee gets subset
-- ============================================

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
