-- Curated partner dealer network and CRM-ready lead pipeline.

-- Keep old LeadStatus values valid for existing data, add the new CRM stages.
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'RESERVED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'SOLD';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'LOST';

-- Dealer status enum.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DealerStatus') THEN
    CREATE TYPE "DealerStatus" AS ENUM ('ACTIVE', 'HIDDEN');
  END IF;
END $$;

-- Partner dealers are curated and admin-controlled.
CREATE TABLE IF NOT EXISTS "Dealer" (
    "id"           TEXT           NOT NULL,
    "name"         TEXT           NOT NULL,
    "slug"         TEXT           NOT NULL,
    "logo"         TEXT,
    "phone"        TEXT           NOT NULL,
    "viber"        TEXT,
    "instagram"    TEXT,
    "facebook"     TEXT,
    "location"     TEXT           NOT NULL,
    "address"      TEXT,
    "description"  TEXT,
    "workingHours" TEXT,
    "isVerified"   BOOLEAN        NOT NULL DEFAULT true,
    "status"       "DealerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Dealer_slug_key" ON "Dealer"("slug");
CREATE INDEX IF NOT EXISTS "Dealer_status_idx" ON "Dealer"("status");
CREATE INDEX IF NOT EXISTS "Dealer_slug_idx" ON "Dealer"("slug");

-- Default/fallback dealer for inventory that existed before partner dealers.
INSERT INTO "Dealer" (
    "id",
    "name",
    "slug",
    "phone",
    "viber",
    "instagram",
    "facebook",
    "location",
    "address",
    "workingHours",
    "description",
    "isVerified",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'default-dealer',
    COALESCE(NULLIF(ds."businessName", ''), 'Moj Auto Diler'),
    'moj-auto-diler',
    COALESCE(NULLIF(ds."phone", ''), ''),
    NULLIF(ds."viber", ''),
    NULLIF(ds."instagramUrl", ''),
    NULLIF(ds."facebookUrl", ''),
    COALESCE(NULLIF(ds."city", ''), 'Srbija'),
    NULLIF(ds."address", ''),
    NULLIF(ds."workingHours", ''),
    'Default dealer used for vehicles created before partner dealer assignment.',
    true,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT 1) seed
LEFT JOIN LATERAL (
    SELECT *
    FROM "DealerSettings"
    ORDER BY "updatedAt" DESC
    LIMIT 1
) ds ON true
ON CONFLICT ("slug") DO UPDATE SET
    "name" = EXCLUDED."name",
    "phone" = EXCLUDED."phone",
    "viber" = EXCLUDED."viber",
    "instagram" = EXCLUDED."instagram",
    "facebook" = EXCLUDED."facebook",
    "location" = EXCLUDED."location",
    "address" = EXCLUDED."address",
    "workingHours" = EXCLUDED."workingHours",
    "isVerified" = true,
    "status" = 'ACTIVE',
    "updatedAt" = CURRENT_TIMESTAMP;

-- Vehicle partner assignment and per-vehicle contact override.
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "dealerId" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactViber" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactName" TEXT;

CREATE INDEX IF NOT EXISTS "Vehicle_dealerId_idx" ON "Vehicle"("dealerId");

-- Existing vehicles should keep working and receive the fallback dealer.
UPDATE "Vehicle"
SET "dealerId" = (
    SELECT "id"
    FROM "Dealer"
    WHERE "slug" = 'moj-auto-diler'
    LIMIT 1
)
WHERE "dealerId" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_dealerId_fkey'
  ) THEN
    ALTER TABLE "Vehicle"
      ADD CONSTRAINT "Vehicle_dealerId_fkey"
      FOREIGN KEY ("dealerId")
      REFERENCES "Dealer"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Lead dealer attribution and intent tracking.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "dealerId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "dealerName" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "intent" TEXT NOT NULL DEFAULT 'general_inquiry';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "preferredContactChannel" TEXT NOT NULL DEFAULT 'web';

CREATE INDEX IF NOT EXISTS "Lead_dealerId_idx" ON "Lead"("dealerId");
CREATE INDEX IF NOT EXISTS "Lead_intent_idx" ON "Lead"("intent");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Lead_dealerId_fkey'
  ) THEN
    ALTER TABLE "Lead"
      ADD CONSTRAINT "Lead_dealerId_fkey"
      FOREIGN KEY ("dealerId")
      REFERENCES "Dealer"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
