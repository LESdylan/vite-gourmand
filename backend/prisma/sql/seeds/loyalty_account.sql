INSERT INTO "LoyaltyAccount" ("user_id", "total_earned", "total_spent", "balance", "last_activity_at") VALUES
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  4500, 500,  4000, '2026-02-24 10:00'),
    ((SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    1800, 0,    1800, '2026-02-20 13:00'),
    ((SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), 300,  0,    300,  '2026-01-25 10:00'),
    ((SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  2200, 1000, 1200, '2026-02-05 14:30');
