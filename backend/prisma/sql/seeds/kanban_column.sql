INSERT INTO "KanbanColumn" ("name", "mapped_status", "color", "position", "is_active", "created_by") VALUES
    ('En attente',        'pending',                    '#FFC107', 1, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('Acceptée',          'accepted',                   '#2196F3', 2, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('En préparation',    'preparing',                  '#FF9800', 3, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('En livraison',      'delivering',                 '#9C27B0', 4, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('Livrée',            'delivered',                  '#4CAF50', 5, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('Retour matériel',   'awaiting_material_return',   '#795548', 6, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('Terminée',          'completed',                  '#8BC34A', 7, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr')),
    ('Annulée',           'cancelled',                  '#F44336', 8, TRUE, (SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr'));
