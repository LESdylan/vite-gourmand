INSERT INTO "OrderStatusHistory" ("order_id", "old_status", "new_status", "notes", "changed_at") VALUES
    (1, 'pending',    'accepted',   'Commande validée par Pierre',       '2026-01-10 10:00'),
    (1, 'accepted',   'preparing',  'Cuisine lancée',                    '2026-02-12 08:00'),
    (1, 'preparing',  'delivering', 'Livreur en route',                  '2026-02-14 16:00'),
    (1, 'delivering', 'delivered',  'Livré avec succès',                 '2026-02-14 18:30'),
    (1, 'delivered',  'completed',  'Matériel retourné',                 '2026-02-24 10:00'),
    (2, 'pending',    'accepted',   'Validé',                            '2026-01-13 09:00'),
    (2, 'accepted',   'preparing',  NULL,                                '2026-02-18 07:00'),
    (2, 'preparing',  'delivering', NULL,                                '2026-02-20 10:00'),
    (2, 'delivering', 'delivered',  'Livré à Lyon',                      '2026-02-20 13:00'),
    (8, 'pending',    'cancelled',  'Client a annulé avant acceptation', '2026-01-25 10:00');
