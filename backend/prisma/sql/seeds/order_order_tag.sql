INSERT INTO "OrderOrderTag" ("order_id", "tag_id") VALUES
    (1, (SELECT "id" FROM "OrderTag" WHERE "label"='vip')),
    (1, (SELECT "id" FROM "OrderTag" WHERE "label"='gros-evt')),
    (5, (SELECT "id" FROM "OrderTag" WHERE "label"='urgent')),
    (6, (SELECT "id" FROM "OrderTag" WHERE "label"='gros-evt')),
    (6, (SELECT "id" FROM "OrderTag" WHERE "label"='weekend')),
    (7, (SELECT "id" FROM "OrderTag" WHERE "label"='fragile'));
