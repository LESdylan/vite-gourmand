-- ============================================
-- MENU MANAGEMENT SCHEMA
-- ============================================
-- Covers: Diet, Theme, Menu, MenuImage, Dish,
--         MenuDish, Allergen, DishAllergen,
--         Ingredient, DishIngredient, MenuIngredient
-- ============================================

-- Diet categories
CREATE TABLE IF NOT EXISTS "Diet" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "icon_url"    VARCHAR(255)
);

COMMENT ON TABLE "Diet" IS 'Subject: Régime — Végétarien, Végan, Classique, etc.';

-- Theme categories
CREATE TABLE IF NOT EXISTS "Theme" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "icon_url"    VARCHAR(255)
);

COMMENT ON TABLE "Theme" IS 'Subject: Thème — Noël, Pâques, Classique, Événement.';

-- Menus
CREATE TABLE IF NOT EXISTS "Menu" (
    "id"               SERIAL PRIMARY KEY,
    "title"            VARCHAR(255)   NOT NULL,
    "description"      TEXT,
    "conditions"       TEXT,
    "person_min"       INTEGER        NOT NULL CHECK ("person_min" > 0),
    "price_per_person" DECIMAL(10,2)  NOT NULL CHECK ("price_per_person" > 0),
    "remaining_qty"    INTEGER        NOT NULL CHECK ("remaining_qty" >= 0),
    "status"           VARCHAR(20)    NOT NULL DEFAULT 'published'
                       CHECK ("status" IN ('draft', 'published', 'archived')),
    "diet_id"          INTEGER        REFERENCES "Diet"("id"),
    "theme_id"         INTEGER        REFERENCES "Theme"("id"),
    "created_by"       INTEGER        REFERENCES "User"("id"),
    "is_seasonal"      BOOLEAN        NOT NULL DEFAULT FALSE,
    "available_from"   DATE,
    "available_until"  DATE,
    "created_at"       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at"     TIMESTAMP
);

COMMENT ON TABLE  "Menu"                  IS 'Catering menus — subject core entity.';
COMMENT ON COLUMN "Menu"."conditions"     IS 'Subject: lead time, storage precautions.';
COMMENT ON COLUMN "Menu"."remaining_qty"  IS 'Subject: stock disponible (e.g. 5 commandes restantes).';

CREATE INDEX IF NOT EXISTS "idx_menu_status"     ON "Menu"("status");
CREATE INDEX IF NOT EXISTS "idx_menu_diet_theme" ON "Menu"("diet_id", "theme_id");
CREATE INDEX IF NOT EXISTS "idx_menu_title"      ON "Menu"("title");

-- Menu images
CREATE TABLE IF NOT EXISTS "MenuImage" (
    "id"            SERIAL PRIMARY KEY,
    "menu_id"       INTEGER      NOT NULL REFERENCES "Menu"("id") ON DELETE CASCADE,
    "image_url"     VARCHAR(500) NOT NULL,
    "alt_text"      VARCHAR(255),
    "display_order" INTEGER      NOT NULL DEFAULT 0,
    "is_primary"    BOOLEAN      NOT NULL DEFAULT FALSE,
    "uploaded_at"   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_menu_image_menu" ON "MenuImage"("menu_id");

-- Dishes
CREATE TABLE IF NOT EXISTS "Dish" (
    "id"          SERIAL PRIMARY KEY,
    "title"       VARCHAR(255) NOT NULL,
    "description" TEXT,
    "photo_url"   VARCHAR(500),
    "course_type" VARCHAR(20)  NOT NULL DEFAULT 'plat'
                  CHECK ("course_type" IN ('entree', 'plat', 'dessert')),
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "Dish" IS 'Subject: entrée, plat, dessert — shared across menus via MenuDish.';

CREATE INDEX IF NOT EXISTS "idx_dish_course" ON "Dish"("course_type");

-- Junction: Menu ↔ Dish (M:N)
CREATE TABLE IF NOT EXISTS "MenuDish" (
    "menu_id" INTEGER NOT NULL REFERENCES "Menu"("id") ON DELETE CASCADE,
    "dish_id" INTEGER NOT NULL REFERENCES "Dish"("id") ON DELETE CASCADE,
    PRIMARY KEY ("menu_id", "dish_id")
);

COMMENT ON TABLE "MenuDish" IS 'Subject: dishes can appear in multiple menus (M:N).';

-- 14 EU Allergens
CREATE TABLE IF NOT EXISTS "Allergen" (
    "id"       SERIAL PRIMARY KEY,
    "name"     VARCHAR(100) NOT NULL UNIQUE,
    "icon_url" VARCHAR(255)
);

COMMENT ON TABLE "Allergen" IS '14 major EU allergens (Regulation 1169/2011).';

-- Junction: Dish ↔ Allergen (M:N)
CREATE TABLE IF NOT EXISTS "DishAllergen" (
    "dish_id"     INTEGER NOT NULL REFERENCES "Dish"("id")     ON DELETE CASCADE,
    "allergen_id" INTEGER NOT NULL REFERENCES "Allergen"("id") ON DELETE CASCADE,
    PRIMARY KEY ("dish_id", "allergen_id")
);

-- Ingredients (stock management)
CREATE TABLE IF NOT EXISTS "Ingredient" (
    "id"               SERIAL PRIMARY KEY,
    "name"             VARCHAR(255)  NOT NULL UNIQUE,
    "unit"             VARCHAR(20)   NOT NULL DEFAULT 'kg',
    "current_stock"    DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_stock_level"  DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cost_per_unit"    DECIMAL(10,2),
    "last_restocked_at" TIMESTAMP,
    "created_at"       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_ingredient_name" ON "Ingredient"("name");

-- Junction: Dish ↔ Ingredient (quantity per serving)
CREATE TABLE IF NOT EXISTS "DishIngredient" (
    "dish_id"       INTEGER       NOT NULL REFERENCES "Dish"("id")       ON DELETE CASCADE,
    "ingredient_id" INTEGER       NOT NULL REFERENCES "Ingredient"("id") ON DELETE CASCADE,
    "quantity"       DECIMAL(10,3) NOT NULL CHECK ("quantity" > 0),
    PRIMARY KEY ("dish_id", "ingredient_id")
);

-- Junction: Menu ↔ Ingredient (quantity per person)
CREATE TABLE IF NOT EXISTS "MenuIngredient" (
    "menu_id"            INTEGER       NOT NULL REFERENCES "Menu"("id")       ON DELETE CASCADE,
    "ingredient_id"      INTEGER       NOT NULL REFERENCES "Ingredient"("id") ON DELETE CASCADE,
    "quantity_per_person" DECIMAL(10,3) NOT NULL CHECK ("quantity_per_person" > 0),
    PRIMARY KEY ("menu_id", "ingredient_id")
);
