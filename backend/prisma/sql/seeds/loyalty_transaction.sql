INSERT INTO "LoyaltyTransaction" ("loyalty_account_id", "order_id", "points", "type", "description") VALUES
    (1, 1,    4500,  'earn',   'Commande ORD-2026-00001 livrée'),
    (1, NULL, -500,  'redeem', 'Réduction appliquée sur ORD-2026-00005'),
    (2, 2,    1800,  'earn',   'Commande ORD-2026-00002 livrée'),
    (3, NULL, 300,   'bonus',  'Bonus bienvenue nouveau client'),
    (4, NULL, 2200,  'earn',   'Cumul commandes'),
    (4, NULL, -1000, 'redeem', 'Réduction fidélité');
