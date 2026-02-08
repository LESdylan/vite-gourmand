-- ============================================
-- KANBAN & ORDER TAGS SCHEMA (Bonus)
-- ============================================

CREATE TABLE IF NOT EXISTS "KanbanColumn" (
    "id"            SERIAL PRIMARY KEY,
    "name"          VARCHAR(100) NOT NULL,
    "mapped_status" VARCHAR(30),
    "color"         VARCHAR(7),
    "position"      INTEGER      NOT NULL DEFAULT 0,
    "is_active"     BOOLEAN      NOT NULL DEFAULT TRUE,
    "created_by"    INTEGER      REFERENCES "User"("id"),
    "created_at"    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OrderTag" (
    "id"         SERIAL PRIMARY KEY,
    "label"      VARCHAR(50) NOT NULL UNIQUE,
    "color"      VARCHAR(7),
    "created_by" INTEGER     REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "OrderOrderTag" (
    "order_id" INTEGER NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "tag_id"   INTEGER NOT NULL REFERENCES "OrderTag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("order_id", "tag_id")
);
