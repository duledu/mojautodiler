-- Repair nullable vehicle contact override columns expected by the current schema.
-- Existing vehicles are preserved; the new columns start as NULL.

ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactViber" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
