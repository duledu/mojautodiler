-- Add UTM + referrer attribution column to Lead.
-- Stores a JSON string captured client-side at the moment of a lead action.
-- Nullable and backwards-compatible — existing leads remain untouched.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "attribution" TEXT;
