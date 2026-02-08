-- ============================================
-- SCHEMA: Loyalty & Promotions
-- ============================================
-- NOTE: This file MUST be loaded BEFORE orders.sql
-- because Order.discount_id references Discount.id
-- ============================================

-- Discount MUST exist before Order (FK dependency)
CREATE TABLE IF NOT EXISTS "Discount" (
    "id"               SERIAL PRIMARY KEY,
    "code"             VARCHAR(50) UNIQUE NOT NULL,
    "description"      TEXT,
    "type"             VARCHAR(20) NOT NULL CHECK ("type" IN ('percentage', 'fixed_amount')),
    "value"            DECIMAL(10,2) NOT NULL CHECK ("value" > 0),
    "min_order_amount" DECIMAL(10,2),
    "max_uses"         INT,
    "current_uses"     INT DEFAULT 0,
    "valid_from"       DATE,
    "valid_until"      DATE,
    "is_active"        BOOLEAN DEFAULT TRUE,
    "created_by"       INT REFERENCES "User"("id")
);

-- NOTE: LoyaltyAccount and LoyaltyTransaction reference Order,
-- so they are created in orders.sql AFTER the Order table.
-- We keep them here as documentation but the actual DDL is in orders.sql.
-- If you need them standalone, ensure Order exists first.

CREATE TABLE IF NOT EXISTS "LoyaltyAccount" (
    "id"               SERIAL PRIMARY KEY,
    "user_id"          INT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "total_earned"     INT DEFAULT 0 CHECK ("total_earned" >= 0),
    "total_spent"      INT DEFAULT 0 CHECK ("total_spent" >= 0),
    "balance"          INT DEFAULT 0 CHECK ("balance" >= 0),
    "last_activity_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
    "id"                 SERIAL PRIMARY KEY,
    "loyalty_account_id" INT NOT NULL REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE,
    "order_id"           INT REFERENCES "Order"("id") ON DELETE SET NULL,
    "points"             INT NOT NULL,
    "type"               VARCHAR(20) NOT NULL
                         CHECK ("type" IN ('earn', 'redeem', 'expire', 'bonus')),
    "description"        TEXT,
    "created_at"         TIMESTAMPTZ DEFAULT NOW()
);
