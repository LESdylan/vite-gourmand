INSERT INTO "PasswordResetToken" ("token", "user_id", "expires_at", "used") VALUES
    ('rst_token_alice_valid_001',   (SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  CURRENT_TIMESTAMP + INTERVAL '1 hour',  FALSE),
    ('rst_token_bob_expired_001',   (SELECT "id" FROM "User" WHERE "email" = 'bob@example.fr'),    CURRENT_TIMESTAMP - INTERVAL '2 hours', FALSE),
    ('rst_token_claire_used_001',   (SELECT "id" FROM "User" WHERE "email" = 'claire@example.fr'), CURRENT_TIMESTAMP + INTERVAL '30 min',  TRUE);
