INSERT INTO "DishIngredient" ("dish_id", "ingredient_id", "quantity") VALUES
    -- Foie Gras: 150g foie gras + 50g farine
    (1, (SELECT "id" FROM "Ingredient" WHERE "name"='Foie Gras'), 0.150),
    (1, (SELECT "id" FROM "Ingredient" WHERE "name"='Farine'),    0.050),
    -- Wellington: 250g bœuf + 100g champignons + 50g farine + 30g beurre
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Filet de Bœuf'), 0.250),
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Champignons'),   0.100),
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Farine'),        0.050),
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'),        0.030),
    -- Risotto: 150g champignons + 100g riz + 20g beurre
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Champignons'),   0.150),
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Riz Arborio'),   0.100),
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'),        0.020),
    -- Homard: 400g homard + 20g beurre
    (6, (SELECT "id" FROM "Ingredient" WHERE "name"='Homard'), 0.400),
    (6, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'), 0.020),
    -- Paris-Brest: 3 œufs + 80g farine + 60g beurre
    (9, (SELECT "id" FROM "Ingredient" WHERE "name"='Œufs'),   3.000),
    (9, (SELECT "id" FROM "Ingredient" WHERE "name"='Farine'), 0.080),
    (9, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'), 0.060);
