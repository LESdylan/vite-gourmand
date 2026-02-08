-- ============================================
-- LOYALTY & PROMOTIONS SCHEMA (Bonus)
-- ============================================

CREATE TABLE IF NOT EXISTS "LoyaltyAccount" (
    "id"               SERIAL PRIMARY KEY,
    "user_id"          INTEGER NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "total_earned"     INTEGER NOT NULL DEFAULT 0 CHECK ("total_earned" >= 0),
    "total_spent"      INTEGER NOT NULL DEFAULT 0 CHECK ("total_spent"  >= 0),
    "balance"          INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
    "id"                 SERIAL PRIMARY KEY,
    "loyalty_account_id" INTEGER     NOT NULL REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE,
    "order_id"           INTEGER     REFERENCES "Order"("id") ON DELETE SET NULL,
    "points"             INTEGER     NOT NULL,
    "type"               VARCHAR(20) NOT NULL CHECK ("type" IN ('earn', 'redeem', 'expire', 'bonus')),
    "description"        TEXT,
    "created_at"         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Discount" (
    "id"               SERIAL PRIMARY KEY,
    "code"             VARCHAR(50)   NOT NULL UNIQUE,
    "description"      TEXT,
    "type"             VARCHAR(20)   NOT NULL CHECK ("type" IN ('percentage', 'fixed_amount')),
    "value"            DECIMAL(10,2) NOT NULL CHECK ("value" > 0),
    "min_order_amount" DECIMAL(10,2),
    "max_uses"         INTEGER,
    "current_uses"     INTEGER       NOT NULL DEFAULT 0,
    "valid_from"       DATE,
    "valid_until"      DATE,
    "is_active"        BOOLEAN       NOT NULL DEFAULT TRUE,
    "created_by"       INTEGER       REFERENCES "User"("id")
);
