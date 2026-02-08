-- ============================================
-- GDPR & CONSENT SCHEMA
-- ============================================
-- Covers: UserConsent, DataDeletionRequest
-- Implements: Right to Access, Right to Erasure,
--             Consent Management (RGPD compliance)
-- ============================================

CREATE TABLE IF NOT EXISTS "UserConsent" (
    "id"           SERIAL PRIMARY KEY,
    "user_id"      INTEGER     NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "consent_type" VARCHAR(50) NOT NULL
                   CHECK ("consent_type" IN ('marketing', 'analytics', 'cookies', 'terms_of_service')),
    "is_granted"   BOOLEAN     NOT NULL,
    "granted_at"   TIMESTAMP,
    "revoked_at"   TIMESTAMP,
    "ip_address"   VARCHAR(45)
);

COMMENT ON TABLE  "UserConsent"              IS 'GDPR consent records — proof of user agreement.';
COMMENT ON COLUMN "UserConsent"."ip_address" IS 'IP at the time of consent for legal proof.';

CREATE INDEX IF NOT EXISTS "idx_consent_user" ON "UserConsent"("user_id");

-- --------------------------------------------
-- Data Deletion Requests (Right to Erasure)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "DataDeletionRequest" (
    "id"           SERIAL PRIMARY KEY,
    "user_id"      INTEGER     REFERENCES "User"("id") ON DELETE SET NULL,
    "reason"       TEXT,
    "status"       VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK ("status" IN ('pending', 'approved', 'completed', 'rejected')),
    "requested_at" TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP,
    "processed_by" INTEGER     REFERENCES "User"("id")
);

COMMENT ON TABLE "DataDeletionRequest" IS 'GDPR deletion requests. Admin must process within 72 hours.';
