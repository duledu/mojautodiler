-- Soft-delete support for Lead.
-- Adds deletedAt timestamp; NULL means active, non-NULL means deleted.
-- Backwards-compatible: all existing leads are active (deletedAt IS NULL).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Lead_deletedAt_idx" ON "Lead"("deletedAt");
