INSERT INTO "UserSession" ("user_id", "session_token", "ip_address", "user_agent", "expires_at", "is_active") VALUES
    ((SELECT "id" FROM "User" WHERE "email" = 'jose@vitegourmand.fr'),  'sess_admin_001_test_token',    '192.168.1.10', 'Mozilla/5.0 Chrome/120', CURRENT_TIMESTAMP + INTERVAL '7 days',  TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'pierre@vitegourmand.fr'),'sess_employee_001_test_token', '192.168.1.20', 'Mozilla/5.0 Firefox/121', CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),      'sess_client_001_test_token',   '82.120.45.12', 'Mozilla/5.0 Safari/17',   CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'bob@example.fr'),        'sess_client_002_test_token',   '90.55.12.34',  'Mozilla/5.0 Chrome/120',  CURRENT_TIMESTAMP + INTERVAL '7 days', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),      'sess_client_003_expired',      '82.120.45.12', 'Mozilla/5.0 Safari/17',   CURRENT_TIMESTAMP - INTERVAL '1 day',  FALSE);
