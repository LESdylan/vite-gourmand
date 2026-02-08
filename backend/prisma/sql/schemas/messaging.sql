-- ============================================
-- MESSAGING & SUPPORT SCHEMA (Bonus)
-- ============================================

CREATE TABLE IF NOT EXISTS "Message" (
    "id"           SERIAL PRIMARY KEY,
    "sender_id"    INTEGER     REFERENCES "User"("id") ON DELETE SET NULL,
    "recipient_id" INTEGER     REFERENCES "User"("id") ON DELETE SET NULL,
    "subject"      VARCHAR(255),
    "body"         TEXT        NOT NULL,
    "priority"     VARCHAR(20) NOT NULL DEFAULT 'normal'
                   CHECK ("priority" IN ('low', 'normal', 'high', 'urgent')),
    "is_read"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "sent_at"      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at"      TIMESTAMP,
    "parent_id"    INTEGER     REFERENCES "Message"("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id"         SERIAL PRIMARY KEY,
    "user_id"    INTEGER     NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type"       VARCHAR(50) NOT NULL
                 CHECK ("type" IN ('order_update', 'delivery', 'promo', 'system', 'review')),
    "title"      VARCHAR(255),
    "body"       TEXT,
    "link_url"   VARCHAR(500),
    "is_read"    BOOLEAN     NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at"    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_notif_unread" ON "Notification"("user_id", "is_read") WHERE "is_read" = FALSE;

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id"            SERIAL PRIMARY KEY,
    "ticket_number" VARCHAR(50) NOT NULL UNIQUE,
    "created_by"    INTEGER     REFERENCES "User"("id") ON DELETE SET NULL,
    "assigned_to"   INTEGER     REFERENCES "User"("id") ON DELETE SET NULL,
    "category"      VARCHAR(50) NOT NULL CHECK ("category" IN ('order', 'payment', 'delivery', 'account', 'other')),
    "priority"      VARCHAR(20) NOT NULL DEFAULT 'normal'
                    CHECK ("priority" IN ('low', 'normal', 'high', 'urgent')),
    "status"        VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK ("status" IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    "subject"       VARCHAR(255) NOT NULL,
    "description"   TEXT,
    "created_at"    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at"   TIMESTAMP,
    "closed_at"     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_ticket_status" ON "SupportTicket"("status", "priority");

CREATE TABLE IF NOT EXISTS "TicketMessage" (
    "id"          SERIAL PRIMARY KEY,
    "ticket_id"   INTEGER NOT NULL REFERENCES "SupportTicket"("id") ON DELETE CASCADE,
    "user_id"     INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
    "body"        TEXT    NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at"  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
