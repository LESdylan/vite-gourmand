-- ============================================
-- CONTACT SCHEMA
-- ============================================
-- Subject: "un formulaire — un titre, une description, son mail"
-- ============================================

CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id"          SERIAL PRIMARY KEY,
    "title"       VARCHAR(255) NOT NULL,
    "description" TEXT         NOT NULL,
    "email"       VARCHAR(255) NOT NULL,
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "ContactMessage" IS 'Subject: contact form — title + description + email.';

CREATE INDEX IF NOT EXISTS "idx_contact_created" ON "ContactMessage"("created_at" DESC);
