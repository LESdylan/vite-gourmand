-- ============================================
-- SEED: Permissions (RBAC matrix)
-- ============================================

INSERT INTO "Permission" ("name", "resource", "action") VALUES
    ('create_users',    'users',     'create'),
    ('read_users',      'users',     'read'),
    ('update_users',    'users',     'update'),
    ('delete_users',    'users',     'delete'),
    ('create_menus',    'menus',     'create'),
    ('read_menus',      'menus',     'read'),
    ('update_menus',    'menus',     'update'),
    ('delete_menus',    'menus',     'delete'),
    ('read_orders',     'orders',    'read'),
    ('update_orders',   'orders',    'update'),
    ('read_reviews',    'reviews',   'read'),
    ('update_reviews',  'reviews',   'update'),
    ('read_analytics',  'analytics', 'read'),
    ('update_settings', 'settings',  'update')
ON CONFLICT ("name") DO NOTHING;
