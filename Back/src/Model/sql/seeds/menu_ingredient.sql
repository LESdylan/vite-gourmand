-- Extra menu-level ingredient needs (beyond dish-level)
INSERT INTO "MenuIngredient" ("menu_id", "ingredient_id", "quantity_per_person") VALUES
    -- Brunch needs crème fraîche per person
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Crème Fraîche'), 0.050),
    (4, (SELECT "id" FROM "Ingredient" WHERE "name"='Œufs'),          2.000),
    -- Gastronomique needs beurre for sauces
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Beurre'),        0.040),
    (5, (SELECT "id" FROM "Ingredient" WHERE "name"='Crème Fraîche'), 0.080);

-- Menu-level ingredient needs (beyond dish-level)
INSERT INTO "MenuIngredient" ("menu_id","ingredient_id","quantity_per_person") VALUES
    (1,1,0.150),(1,2,0.250),(1,3,0.100),(1,5,0.050),(1,6,0.060),
    (2,3,0.200),(2,9,0.100),(2,13,0.300),(2,14,0.150),(2,15,0.200),
    (5,1,0.150),(5,7,0.400),(5,8,0.200)
ON CONFLICT DO NOTHING;
