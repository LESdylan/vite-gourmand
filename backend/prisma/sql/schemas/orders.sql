-- ============================================
-- ORDER LIFECYCLE SCHEMA
-- ============================================
-- Covers: Order, OrderStatusHistory, DeliveryAssignment
-- Subject: 8 statuses, delivery pricing, 10% discount,
--          material lending, cancellation with reason
-- ============================================

CREATE TABLE IF NOT EXISTS "Order" (
    "id"                       SERIAL PRIMARY KEY,
    "order_number"             VARCHAR(50)   NOT NULL UNIQUE,
    "user_id"                  INTEGER       NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,

    -- Dates
    "order_date"               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_date"            DATE          NOT NULL,
    "delivery_hour"            VARCHAR(10),

    -- Delivery
    "delivery_address"         TEXT,
    "delivery_city"            VARCHAR(100)  NOT NULL DEFAULT 'Bordeaux',
    "delivery_distance_km"     DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Pricing
    "person_number"            INTEGER       NOT NULL CHECK ("person_number" > 0),
    "menu_price"               DECIMAL(10,2) NOT NULL CHECK ("menu_price" >= 0),
    "delivery_price"           DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK ("delivery_price" >= 0),
    "discount_percent"         DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK ("discount_percent" >= 0 AND "discount_percent" <= 100),
    "discount_amount"          DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK ("discount_amount" >= 0),
    "total_price"              DECIMAL(10,2) NOT NULL CHECK ("total_price" >= 0),

    -- Status (8 states)
    "status"                   VARCHAR(30)   NOT NULL DEFAULT 'pending'
                               CHECK ("status" IN (
                                   'pending', 'accepted', 'preparing', 'delivering',
                                   'delivered', 'awaiting_material_return', 'completed', 'cancelled'
                               )),

    -- Material lending
    "material_lending"         BOOLEAN       NOT NULL DEFAULT FALSE,
    "material_returned"        BOOLEAN       NOT NULL DEFAULT FALSE,
    "material_return_deadline" TIMESTAMP,

    -- Cancellation
    "cancellation_reason"      TEXT,
    "cancellation_contact_mode" VARCHAR(20)  CHECK ("cancellation_contact_mode" IN ('gsm', 'email')),

    "special_instructions"     TEXT,

    -- Status timestamps
    "confirmed_at"             TIMESTAMP,
    "delivered_at"             TIMESTAMP,
    "cancelled_at"             TIMESTAMP,
    "created_at"               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  "Order"                        IS 'Customer orders with full lifecycle tracking.';
COMMENT ON COLUMN "Order"."delivery_price"       IS 'Subject: €5 + €0.59/km if outside Bordeaux.';
COMMENT ON COLUMN "Order"."discount_percent"     IS 'Subject: 10% if person_number >= person_min + 5.';
COMMENT ON COLUMN "Order"."cancellation_reason"  IS 'Subject: employee must contact client + state reason.';
COMMENT ON COLUMN "Order"."material_return_deadline" IS 'Subject: 10 business days, €600 penalty.';

CREATE INDEX IF NOT EXISTS "idx_order_user_date"     ON "Order"("user_id", "order_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_order_status"        ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_order_number"        ON "Order"("order_number");
CREATE INDEX IF NOT EXISTS "idx_order_delivery_date" ON "Order"("delivery_date");

-- Status history (audit trail)
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id"         SERIAL PRIMARY KEY,
    "order_id"   INTEGER     NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "old_status" VARCHAR(30),
    "new_status" VARCHAR(30) NOT NULL,
    "notes"      TEXT,
    "changed_at" TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "OrderStatusHistory" IS 'Subject: suivi de commande avec date et heure.';

CREATE INDEX IF NOT EXISTS "idx_osh_order" ON "OrderStatusHistory"("order_id");

-- Delivery assignments (bonus)
CREATE TABLE IF NOT EXISTS "DeliveryAssignment" (
    "id"                 SERIAL PRIMARY KEY,
    "order_id"           INTEGER     NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "delivery_person_id" INTEGER     REFERENCES "User"("id"),
    "vehicle_type"       VARCHAR(50),
    "status"             VARCHAR(20) NOT NULL DEFAULT 'assigned'
                         CHECK ("status" IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
    "assigned_at"        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picked_up_at"       TIMESTAMP,
    "delivered_at"       TIMESTAMP,
    "delivery_notes"     TEXT,
    "proof_photo_url"    VARCHAR(500),
    "client_rating"      INTEGER     CHECK ("client_rating" BETWEEN 1 AND 5)
);
