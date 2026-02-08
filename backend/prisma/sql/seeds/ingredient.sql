INSERT INTO "Ingredient" ("name", "unit", "current_stock", "min_stock_level", "cost_per_unit") VALUES
    ('Foie Gras',       'kg',     5.00,   1.00,  120.00),
    ('Filet de Bœuf',   'kg',     20.00,  5.00,  45.00),
    ('Champignons',     'kg',     15.00,  3.00,  8.00),
    ('Œufs',            'pièces', 200.00, 50.00, 0.30),
    ('Farine',          'kg',     50.00,  10.00, 1.50),
    ('Beurre',          'kg',     10.00,  2.00,  12.00),
    ('Homard',          'kg',     8.00,   2.00,  80.00),
    ('Crème Fraîche',   'litres', 12.00,  3.00,  5.50),
    ('Riz Arborio',     'kg',     25.00,  5.00,  4.00),
    ('Saumon Frais',    'kg',     10.00,  2.00,  32.00)
ON CONFLICT ("name") DO NOTHING;
