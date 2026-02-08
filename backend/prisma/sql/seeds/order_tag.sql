INSERT INTO "OrderTag" ("label", "color", "created_by") VALUES
    ('urgent',   '#F44336', (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('vip',      '#FFD700', (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('fragile',  '#FF9800', (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('weekend',  '#2196F3', (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('gros-evt', '#9C27B0', (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr'))
ON CONFLICT ("label") DO NOTHING;
