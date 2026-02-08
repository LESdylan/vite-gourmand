-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================
-- Auto-update timestamps and order status tracking
-- ============================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to mutable tables
CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_menu_updated_at
    BEFORE UPDATE ON "Menu"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_order_updated_at
    BEFORE UPDATE ON "Order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_publish_updated_at
    BEFORE UPDATE ON "Publish"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ingredient_updated_at
    BEFORE UPDATE ON "Ingredient"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Auto-track order status changes
-- Subject: "suivi de commande avec date et heure"
-- ============================================

CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."status" IS DISTINCT FROM NEW."status" THEN
        INSERT INTO "OrderStatusHistory" ("order_id", "old_status", "new_status", "changed_at")
        VALUES (NEW."id", OLD."status", NEW."status", CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_change
    AFTER UPDATE ON "Order"
    FOR EACH ROW EXECUTE FUNCTION track_order_status_change();

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Active published menus with diet and theme
CREATE OR REPLACE VIEW "v_active_menus" AS
SELECT
    "m"."id",
    "m"."title",
    "m"."description",
    "m"."conditions",
    "m"."person_min",
    "m"."price_per_person",
    "m"."remaining_qty",
    "d"."name" AS "diet",
    "t"."name" AS "theme"
FROM "Menu" AS "m"
LEFT JOIN "Diet"  AS "d" ON "m"."diet_id"  = "d"."id"
LEFT JOIN "Theme" AS "t" ON "m"."theme_id" = "t"."id"
WHERE "m"."status" = 'published'
  AND "m"."remaining_qty" > 0;

-- Pending reviews for moderation
CREATE OR REPLACE VIEW "v_pending_reviews" AS
SELECT
    "p"."id",
    "p"."note",
    "p"."description",
    "p"."created_at",
    "u"."first_name",
    "u"."last_name",
    "u"."email"
FROM "Publish" AS "p"
JOIN "User" AS "u" ON "p"."user_id" = "u"."id"
WHERE "p"."status" = 'pending'
ORDER BY "p"."created_at" ASC;
