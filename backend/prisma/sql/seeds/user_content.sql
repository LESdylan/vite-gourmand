-- ============================================
-- SEED: UserConsent (GDPR tracking)
-- ============================================

INSERT INTO "UserConsent" ("user_id", "consent_type", "is_granted", "granted_at", "ip_address") VALUES
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  'terms_of_service', TRUE,  CURRENT_TIMESTAMP, '82.120.45.12'),
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  'marketing',        FALSE, NULL,              '82.120.45.12'),
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  'analytics',        TRUE,  CURRENT_TIMESTAMP, '82.120.45.12'),
    ((SELECT "id" FROM "User" WHERE "email" = 'bob@example.fr'),    'terms_of_service', TRUE,  CURRENT_TIMESTAMP, '90.55.12.34'),
    ((SELECT "id" FROM "User" WHERE "email" = 'bob@example.fr'),    'marketing',        TRUE,  CURRENT_TIMESTAMP, '90.55.12.34'),
    ((SELECT "id" FROM "User" WHERE "email" = 'claire@example.fr'), 'terms_of_service', TRUE,  CURRENT_TIMESTAMP, '78.200.10.5'),
    ((SELECT "id" FROM "User" WHERE "email" = 'claire@example.fr'), 'cookies',          TRUE,  CURRENT_TIMESTAMP, '78.200.10.5'),
    ((SELECT "id" FROM "User" WHERE "email" = 'david@example.fr'),  'terms_of_service', TRUE,  CURRENT_TIMESTAMP, '176.30.22.8'),
    ((SELECT "id" FROM "User" WHERE "email" = 'david@example.fr'),  'marketing',        FALSE, NULL,              '176.30.22.8'),
    ((SELECT "id" FROM "User" WHERE "email" = 'david@example.fr'),  'analytics',        TRUE,  CURRENT_TIMESTAMP, '176.30.22.8');
