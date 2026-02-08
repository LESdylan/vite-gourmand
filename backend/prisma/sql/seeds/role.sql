-- ============================================
-- SEED: Roles (4 subject roles)
-- ============================================

INSERT INTO "Role" ("name", "description") VALUES
    ('superadmin',  'Développeur — accès total infrastructure'),
    ('admin',       'Administrateur (José) — gestion employés + analytics'),
    ('employee',    'Employé — menus, commandes, modération'),
    ('utilisateur', 'Client — navigation, commandes, avis')
ON CONFLICT ("name") DO NOTHING;
