-- Extra menu-level ingredient needs (beyond dish-level)
INSERT INTO "MenuIngredient" ("menu_id", "ingredient_id", "quantity_per_person") VALUES
    -- Brunch needs crème fraîche per person
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Crème Fraîche'), 0.050),
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Œufs'),          2.000),
    -- Gastronomique needs beurre for sauces
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'),        0.040),
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Crème Fraîche'), 0.080);
