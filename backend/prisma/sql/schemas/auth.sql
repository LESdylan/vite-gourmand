-- ============================================
-- AUTHENTICATION & AUTHORIZATION SCHEMA
-- ============================================
-- Covers: Role, Permission, RolePermission, User,
--         UserAddress, PasswordResetToken, UserSession
-- Subject: "José précise que vous devez lui créer ce compte"
-- ============================================

-- --------------------------------------------
-- Roles
-- Subject: admin (José, seeded), employee, utilisateur
-- Admin accounts CANNOT be created from the application.
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "Role" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(50)  NOT NULL UNIQUE
                  CHECK ("name" IN ('superadmin', 'admin', 'employee', 'utilisateur')),
    "description" TEXT,
    "created_at"  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  "Role"        IS 'User roles. Admin is seeded only — cannot be created via the app.';
COMMENT ON COLUMN "Role"."name" IS 'Constrained to 4 allowed values. superadmin is dev-only.';

-- --------------------------------------------
-- Permissions (RBAC — granular access control)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "Permission" (
    "id"       SERIAL PRIMARY KEY,
    "name"     VARCHAR(100) NOT NULL UNIQUE,
    "resource" VARCHAR(50)  NOT NULL
               CHECK ("resource" IN ('users', 'menus', 'dishes', 'orders', 'reviews', 'analytics', 'settings')),
    "action"   VARCHAR(20)  NOT NULL
               CHECK ("action" IN ('create', 'read', 'update', 'delete'))
);

COMMENT ON TABLE "Permission" IS 'Granular RBAC permissions: resource × action pairs.';

-- --------------------------------------------
-- Junction: Role ↔ Permission (M:N)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "role_id"       INTEGER NOT NULL REFERENCES "Role"("id")       ON DELETE CASCADE,
    "permission_id" INTEGER NOT NULL REFERENCES "Permission"("id") ON DELETE CASCADE,
    PRIMARY KEY ("role_id", "permission_id")
);

-- --------------------------------------------
-- Users
-- Subject registration: nom, prénom, GSM, email, adresse postale
-- Password: 10 chars min, 1 special, 1 upper, 1 lower, 1 digit
-- Stored as bcrypt hash (min 12 rounds).
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id"                 SERIAL PRIMARY KEY,
    "email"              VARCHAR(255) NOT NULL UNIQUE,
    "password"           VARCHAR(255) NOT NULL,
    "first_name"         VARCHAR(100) NOT NULL,
    "last_name"          VARCHAR(100),
    "phone_number"       VARCHAR(20),
    "city"               VARCHAR(100),
    "country"            VARCHAR(100) DEFAULT 'France',
    "postal_code"        VARCHAR(10),

    -- FK to Role
    "role_id"            INTEGER REFERENCES "Role"("id"),

    -- Account status
    "is_active"          BOOLEAN NOT NULL DEFAULT TRUE,
    "is_email_verified"  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Soft deletion (GDPR right to erasure)
    "is_deleted"         BOOLEAN NOT NULL DEFAULT FALSE,
    "deleted_at"         TIMESTAMP,

    -- Preferences
    "preferred_language" VARCHAR(5) NOT NULL DEFAULT 'fr',

    -- GDPR consent
    "gdpr_consent"       BOOLEAN NOT NULL DEFAULT FALSE,
    "gdpr_consent_date"  TIMESTAMP,
    "marketing_consent"  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    "created_at"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at"      TIMESTAMP
);

COMMENT ON TABLE  "User"              IS 'All platform users: clients, employees, admins, superadmin.';
COMMENT ON COLUMN "User"."password"   IS 'Bcrypt hash. Subject: 10+ chars, 1 special, 1 upper, 1 lower, 1 digit.';
COMMENT ON COLUMN "User"."is_active"  IS 'Subject: admin can disable employee accounts.';
COMMENT ON COLUMN "User"."is_deleted" IS 'Soft-delete for GDPR. Anonymised after 30-day grace period.';

CREATE INDEX IF NOT EXISTS "idx_user_email_active" ON "User"("email") WHERE "is_deleted" = FALSE;
CREATE INDEX IF NOT EXISTS "idx_user_role"         ON "User"("role_id");

-- --------------------------------------------
-- User Addresses (multiple per user)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "UserAddress" (
    "id"             SERIAL PRIMARY KEY,
    "user_id"        INTEGER      NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "label"          VARCHAR(50)  CHECK ("label" IN ('home', 'work', 'other')),
    "street_address" TEXT         NOT NULL,
    "city"           VARCHAR(100) NOT NULL,
    "postal_code"    VARCHAR(10)  NOT NULL,
    "country"        VARCHAR(100) NOT NULL DEFAULT 'France',
    "latitude"       DECIMAL(10,8),
    "longitude"      DECIMAL(11,8),
    "is_default"     BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_user_address_user" ON "UserAddress"("user_id");

-- --------------------------------------------
-- Password Reset Tokens
-- Subject: "réinitialiser via un bouton — un lien par mail"
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id"         SERIAL PRIMARY KEY,
    "token"      VARCHAR(255) NOT NULL UNIQUE,
    "user_id"    INTEGER      NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP    NOT NULL,
    "used"       BOOLEAN      NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_prt_token"   ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "idx_prt_user_id" ON "PasswordResetToken"("user_id");

-- --------------------------------------------
-- User Sessions (JWT tracking)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id"            SERIAL PRIMARY KEY,
    "user_id"       INTEGER      NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "session_token" VARCHAR(500) NOT NULL UNIQUE,
    "ip_address"    VARCHAR(45),
    "user_agent"    TEXT,
    "created_at"    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"    TIMESTAMP    NOT NULL,
    "is_active"     BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "idx_session_token" ON "UserSession"("session_token");
CREATE INDEX IF NOT EXISTS "idx_session_user"  ON "UserSession"("user_id");
