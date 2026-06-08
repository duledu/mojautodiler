-- Optional Google Maps location fields for Dealer.
-- All nullable; existing dealers remain unaffected (NULL = not configured).
ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "locationName" TEXT;
ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "googleMapsEmbedUrl" TEXT;
ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT;
