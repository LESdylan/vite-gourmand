INSERT INTO "Order" (
    "order_number", "user_id", "order_date", "delivery_date", "delivery_hour",
    "delivery_address", "delivery_city", "delivery_distance_km",
    "person_number", "menu_price", "delivery_price",
    "discount_percent", "discount_amount", "total_price",
    "status", "material_lending"
) VALUES
    ('ORD-2026-00001', (SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  '2026-01-10 09:00', '2026-02-14', '18:00', '10 Rue de Rivoli, 75001',    'Paris',     450.0,  50,  4250.00, 270.50, 10.00, 425.00, 4095.50, 'completed',  TRUE),
    ('ORD-2026-00002', (SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    '2026-01-12 14:00', '2026-02-20', '12:00', '22 Rue de la République',    'Lyon',      550.0,  30,  1350.00, 329.50, 0.00,  0.00,   1679.50, 'delivered',  FALSE),
    ('ORD-2026-00003', (SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), '2026-01-14 10:30', '2026-03-01', '19:00', '8 Quai du Vieux-Port',       'Marseille', 650.0,  25,  1625.00, 388.50, 10.00, 162.50, 1851.00, 'accepted',   FALSE),
    ('ORD-2026-00004', (SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  '2026-01-15 16:00', '2026-02-28', '11:00', '15 Cours de l''Intendance',  'Bordeaux',  0.0,    15,  525.00,  0.00,   0.00,  0.00,   525.00,  'pending',    FALSE),
    ('ORD-2026-00005', (SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  '2026-01-18 11:00', '2026-04-15', '20:00', '5 Avenue Montaigne',         'Paris',     450.0,  10,  1200.00, 270.50, 0.00,  0.00,   1470.50, 'preparing',  TRUE),
    ('ORD-2026-00006', (SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    '2026-01-20 08:30', '2026-03-10', '18:00', '22 Rue de la République',    'Lyon',      550.0,  60,  3900.00, 329.50, 10.00, 390.00, 3839.50, 'delivering', TRUE),
    ('ORD-2026-00007', (SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  '2026-01-22 13:00', '2026-02-05', '17:00', '3 Place des Quinconces',     'Bordeaux',  0.0,    20,  1300.00, 0.00,   0.00,  0.00,   1300.00, 'awaiting_material_return', TRUE),
    ('ORD-2026-00008', (SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), '2026-01-25 09:15', '2026-02-01', '12:00', '8 Quai du Vieux-Port',       'Marseille', 650.0,  20,  700.00,  388.50, 0.00,  0.00,   1088.50, 'cancelled',  FALSE),
    ('ORD-2026-00009', (SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  '2026-02-01 10:00', '2026-03-20', '19:00', '10 Rue de Rivoli, 75001',    'Paris',     450.0,  55,  4675.00, 270.50, 10.00, 467.50, 4478.00, 'pending',    FALSE),
    ('ORD-2026-00010', (SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  '2026-02-05 14:30', '2026-04-01', '18:00', '15 Cours de l''Intendance',  'Bordeaux',  0.0,    30,  2850.00, 0.00,   10.00, 285.00, 2565.00, 'pending',    TRUE);
