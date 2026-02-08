INSERT INTO "TimeOffRequest" ("user_id", "start_date", "end_date", "type", "status", "reason", "decided_by") VALUES
    ((SELECT "id" FROM "User" WHERE "email"='pierre@vitegourmand.fr'), '2026-08-01', '2026-08-14', 'vacation', 'approved', 'Vacances d''été en famille',    (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ((SELECT "id" FROM "User" WHERE "email"='sophie@vitegourmand.fr'), '2026-03-10', '2026-03-12', 'sick',     'approved', 'Grippe',                        (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ((SELECT "id" FROM "User" WHERE "email"='pierre@vitegourmand.fr'), '2026-12-23', '2026-12-26', 'personal', 'pending',  'Fêtes de Noël en famille',      NULL);
