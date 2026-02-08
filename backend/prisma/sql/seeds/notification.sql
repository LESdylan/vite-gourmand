INSERT INTO "Notification" ("user_id", "type", "title", "body", "link_url", "is_read") VALUES
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  'order_update', 'Commande livrée',           'Votre commande ORD-2026-00001 a été livrée.',              '/orders/1', TRUE),
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  'review',       'Laissez un avis',           'Votre commande est terminée. Partagez votre expérience !', '/reviews/new?order=1', FALSE),
    ((SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    'order_update', 'Commande livrée',           'Votre commande ORD-2026-00002 a été livrée.',              '/orders/2', TRUE),
    ((SELECT "id" FROM "User" WHERE "email"='pierre@vitegourmand.fr'), 'system', 'Nouvelle commande',         'Nouvelle commande ORD-2026-00009 à traiter.',              '/admin/orders/9', FALSE),
    ((SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  'promo',        'Code promo !',              'Utilisez BIENVENUE10 pour 10% de réduction.',              '/menus', FALSE),
    ((SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), 'order_update', 'Commande annulée',          'Votre commande ORD-2026-00008 a été annulée.',             '/orders/8', TRUE),
    ((SELECT "id" FROM "User" WHERE "email"='jose@vitegourmand.fr'), 'system',   'Stock bas',                  'L''ingrédient Foie Gras est en dessous du seuil minimum.', '/admin/ingredients', FALSE);
