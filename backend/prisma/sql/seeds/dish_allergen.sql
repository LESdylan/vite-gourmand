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
