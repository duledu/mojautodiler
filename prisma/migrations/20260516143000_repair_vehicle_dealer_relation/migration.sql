-- Repair migration for databases where the dealer migration was not applied
-- or was only partially applied. This is intentionally idempotent.

-- Dealer status enum required by the Dealer table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DealerStatus') THEN
    CREATE TYPE "DealerStatus" AS ENUM ('ACTIVE', 'HIDDEN');
  END IF;
END $$;

-- Partner dealers table. Do not drop or rewrite existing records.
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

-- Add Vehicle.dealerId as nullable first so existing vehicle rows are preserved.
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "dealerId" TEXT;

-- Create or refresh the fallback dealer used for existing inventory.
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

-- Backfill existing vehicles without deleting or recreating inventory/media.
UPDATE "Vehicle"
SET "dealerId" = (
    SELECT "id"
    FROM "Dealer"
    WHERE "slug" = 'moj-auto-diler'
    LIMIT 1
)
WHERE "dealerId" IS NULL;

CREATE INDEX IF NOT EXISTS "Vehicle_dealerId_idx" ON "Vehicle"("dealerId");

-- Keep Vehicle.dealerId nullable because the Prisma schema uses onDelete: SetNull.
-- Making it required would be unsafe while that relation behavior remains nullable.
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
