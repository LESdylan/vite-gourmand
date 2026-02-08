-- ============================================
-- SEED: Users (10 test users — all roles)
-- ============================================
-- Password for ALL test users: Test123!
-- Bcrypt hash ($2b$12$) generated offline.
-- DO NOT use these in production.
-- ============================================

INSERT INTO "User" (
    "email", "password", "first_name", "last_name",
    "phone_number", "city", "country", "postal_code",
    "role_id", "is_active", "gdpr_consent", "gdpr_consent_date"
) VALUES
    -- Superadmin (dev)
    ('dylan@vitegourmand.dev',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Dylan', 'Lesieur', '+33600000000', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'superadmin'), TRUE, TRUE, CURRENT_TIMESTAMP),

    -- Admin (José — subject requirement)
    ('jose@vitegourmand.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'José', 'Garcia', '+33600000001', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'admin'), TRUE, TRUE, CURRENT_TIMESTAMP),

    -- Admin (Julie)
    ('julie@vitegourmand.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Julie', 'Dupont', '+33600000002', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'admin'), TRUE, TRUE, CURRENT_TIMESTAMP),

    -- Employees
    ('pierre@vitegourmand.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Pierre', 'Martin', '+33600000003', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'employee'), TRUE, TRUE, CURRENT_TIMESTAMP),

    ('sophie@vitegourmand.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Sophie', 'Bernard', '+33600000004', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'employee'), TRUE, TRUE, CURRENT_TIMESTAMP),

    -- Disabled employee (testing is_active = false)
    ('marc@vitegourmand.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Marc', 'Lefèvre', '+33600000005', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'employee'), FALSE, TRUE, CURRENT_TIMESTAMP),

    -- Clients (utilisateurs)
    ('alice@example.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Alice', 'Moreau', '+33611111111', 'Paris', 'France', '75001',
     (SELECT "id" FROM "Role" WHERE "name" = 'utilisateur'), TRUE, TRUE, CURRENT_TIMESTAMP),

    ('bob@example.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Bob', 'Petit', '+33622222222', 'Lyon', 'France', '69001',
     (SELECT "id" FROM "Role" WHERE "name" = 'utilisateur'), TRUE, TRUE, CURRENT_TIMESTAMP),

    ('claire@example.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'Claire', 'Dubois', '+33633333333', 'Marseille', 'France', '13001',
     (SELECT "id" FROM "Role" WHERE "name" = 'utilisateur'), TRUE, TRUE, CURRENT_TIMESTAMP),

    ('david@example.fr',
     '$2b$12$LJ3m5ZG0GhDPW0hqAv.Ydu6X7wQm5VKjKzKd0o3kV0QA1f4C6TqHe',
     'David', 'Roux', '+33644444444', 'Bordeaux', 'France', '33000',
     (SELECT "id" FROM "Role" WHERE "name" = 'utilisateur'), TRUE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;
