-- ============================================
-- EMPLOYEE MANAGEMENT SCHEMA (Bonus)
-- ============================================

CREATE TABLE IF NOT EXISTS "TimeOffRequest" (
    "id"           SERIAL PRIMARY KEY,
    "user_id"      INTEGER     NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "start_date"   DATE        NOT NULL,
    "end_date"     DATE        NOT NULL,
    "type"         VARCHAR(20) NOT NULL CHECK ("type" IN ('vacation', 'sick', 'personal')),
    "status"       VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK ("status" IN ('pending', 'approved', 'rejected')),
    "reason"       TEXT,
    "decided_by"   INTEGER     REFERENCES "User"("id"),
    "requested_at" TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at"   TIMESTAMP,

    CONSTRAINT "valid_date_range" CHECK ("end_date" >= "start_date")
);
