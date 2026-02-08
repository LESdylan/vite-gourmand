INSERT INTO "UserAddress" ("user_id", "label", "street_address", "city", "postal_code", "country", "is_default") VALUES
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  'home', '10 Rue de Rivoli',           'Paris',     '75001', 'France', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'alice@example.fr'),  'work', '5 Avenue Montaigne',         'Paris',     '75008', 'France', FALSE),
    ((SELECT "id" FROM "User" WHERE "email" = 'bob@example.fr'),    'home', '22 Rue de la République',    'Lyon',      '69001', 'France', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'claire@example.fr'), 'home', '8 Quai du Vieux-Port',       'Marseille', '13001', 'France', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'david@example.fr'),  'home', '15 Cours de l''Intendance',  'Bordeaux',  '33000', 'France', TRUE),
    ((SELECT "id" FROM "User" WHERE "email" = 'david@example.fr'),  'work', '3 Place des Quinconces',     'Bordeaux',  '33000', 'France', FALSE);
