-- Foie Gras: Gluten, Œufs
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (1, (SELECT "id" FROM "Allergen" WHERE "name"='Gluten')),
    (1, (SELECT "id" FROM "Allergen" WHERE "name"='Œufs'));

-- Velouté: Lait, Céleri
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (2, (SELECT "id" FROM "Allergen" WHERE "name"='Lait')),
    (2, (SELECT "id" FROM "Allergen" WHERE "name"='Céleri'));

-- Tartare Saumon: Poisson, Moutarde
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (3, (SELECT "id" FROM "Allergen" WHERE "name"='Poisson')),
    (3, (SELECT "id" FROM "Allergen" WHERE "name"='Moutarde'));

-- Wellington: Gluten, Œufs, Lait
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (4, (SELECT "id" FROM "Allergen" WHERE "name"='Gluten')),
    (4, (SELECT "id" FROM "Allergen" WHERE "name"='Œufs')),
    (4, (SELECT "id" FROM "Allergen" WHERE "name"='Lait'));

-- Risotto: Lait, Céleri
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (5, (SELECT "id" FROM "Allergen" WHERE "name"='Lait')),
    (5, (SELECT "id" FROM "Allergen" WHERE "name"='Céleri'));

-- Homard: Crustacés
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (6, (SELECT "id" FROM "Allergen" WHERE "name"='Crustacés'));

-- Paris-Brest: Gluten, Œufs, Lait, Fruits à coque
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (9, (SELECT "id" FROM "Allergen" WHERE "name"='Gluten')),
    (9, (SELECT "id" FROM "Allergen" WHERE "name"='Œufs')),
    (9, (SELECT "id" FROM "Allergen" WHERE "name"='Lait')),
    (9, (SELECT "id" FROM "Allergen" WHERE "name"='Fruits à coque'));

-- Crème Brûlée: Œufs, Lait
INSERT INTO "DishAllergen" ("dish_id", "allergen_id") VALUES
    (10, (SELECT "id" FROM "Allergen" WHERE "name"='Œufs')),
    (10, (SELECT "id" FROM "Allergen" WHERE "name"='Lait'));

-- _DishAllergens: A=allergen_id, B=dish_id
INSERT INTO "_DishAllergens" ("A","B") VALUES
    (1,1),(3,1),           -- Foie Gras: Gluten, Œufs
    (7,2),                 -- Velouté: Lait
    (4,3),                 -- Tartare Saumon: Poisson
    (1,4),(3,4),(7,4),     -- Wellington: Gluten, Œufs, Lait
    (7,5),(9,5),           -- Risotto: Lait, Céleri
    (2,6),                 -- Homard: Crustacés
    (1,8),(3,8),(7,8),     -- Œufs Bénédicte: Gluten, Œufs, Lait
    (1,9),(3,9),(7,9),(8,9), -- Paris-Brest: Gluten, Œufs, Lait, Fruits à coque
    (3,10),(7,10),         -- Crème Brûlée: Œufs, Lait
    (1,11),(3,11),(7,11),  -- Salade César: Gluten, Œufs, Lait
    (1,16),(7,16),         -- Tarte Tatin: Gluten, Lait
    (3,17),(7,17),         -- Fondant Chocolat: Œufs, Lait
    (7,18)                 -- Panna Cotta: Lait
ON CONFLICT DO NOTHING;
