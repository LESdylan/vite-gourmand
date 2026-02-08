-- ============================================
-- COMPANY CONFIGURATION SCHEMA
-- ============================================
-- Covers: WorkingHours
-- Subject: "Les horaires doivent être visible sur le pied de page"
-- ============================================

CREATE TABLE IF NOT EXISTS "WorkingHours" (
    "id"      SERIAL PRIMARY KEY,
    "day"     VARCHAR(15) NOT NULL
              CHECK ("day" IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')),
    "opening" VARCHAR(5)  NOT NULL,
    "closing" VARCHAR(5)  NOT NULL
);

COMMENT ON TABLE  "WorkingHours"       IS 'Opening hours displayed in the website footer (Mon–Sun).';
COMMENT ON COLUMN "WorkingHours"."day" IS 'French day names as required by the subject.';
