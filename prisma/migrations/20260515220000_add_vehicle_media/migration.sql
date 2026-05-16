-- CreateTable: VehicleMedia
-- r2Key is nullable — existing images uploaded before this migration have no key.
-- Vehicle.images (String[]) stays as the denormalised URL cache; this table adds
-- proper metadata (size, mime, sort, primary) and enables safe R2 deletions.

CREATE TABLE "VehicleMedia" (
    "id"         TEXT         NOT NULL,
    "vehicleId"  TEXT         NOT NULL,
    "url"        TEXT         NOT NULL,
    "r2Key"      TEXT,
    "type"       TEXT         NOT NULL DEFAULT 'image',
    "mimeType"   TEXT,
    "sizeBytes"  INTEGER,
    "sortOrder"  INTEGER      NOT NULL DEFAULT 0,
    "isPrimary"  BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleMedia_pkey" PRIMARY KEY ("id")
);

-- ForeignKey
ALTER TABLE "VehicleMedia"
    ADD CONSTRAINT "VehicleMedia_vehicleId_fkey"
    FOREIGN KEY ("vehicleId")
    REFERENCES "Vehicle"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique: one record per (vehicle, url) pair
ALTER TABLE "VehicleMedia"
    ADD CONSTRAINT "VehicleMedia_vehicleId_url_key"
    UNIQUE ("vehicleId", "url");

-- Index for ordered gallery queries
CREATE INDEX "VehicleMedia_vehicleId_sortOrder_idx"
    ON "VehicleMedia"("vehicleId", "sortOrder");

-- Backfill: populate VehicleMedia from existing Vehicle.images arrays.
-- Uses unnest WITH ORDINALITY so we preserve the current sort order and mark
-- the first image as primary. r2Key stays NULL for all pre-existing images.
INSERT INTO "VehicleMedia" ("id", "vehicleId", "url", "type", "sortOrder", "isPrimary", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    v."id",
    img.url,
    'image',
    (img.ord - 1)::integer,
    (img.ord = 1),
    NOW(),
    NOW()
FROM "Vehicle" v,
LATERAL unnest(v.images) WITH ORDINALITY AS img(url, ord)
WHERE img.url IS NOT NULL
  AND img.url != ''
ON CONFLICT ("vehicleId", "url") DO NOTHING;
