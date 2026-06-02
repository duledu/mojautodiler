-- Store request metadata used to suppress repeated analytics events safely.
-- Existing leads remain untouched; these columns are nullable by design.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

CREATE INDEX IF NOT EXISTS "Lead_vehicleId_intent_createdAt_idx"
  ON "Lead"("vehicleId", "intent", "createdAt");

CREATE INDEX IF NOT EXISTS "Lead_vehicleId_intent_ipAddress_createdAt_idx"
  ON "Lead"("vehicleId", "intent", "ipAddress", "createdAt");
