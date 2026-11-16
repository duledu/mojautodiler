-- Add carVertical VIN check mode setting for vehicle listings
-- Controls whether the carVertical affiliate URL includes the vehicle VIN (pre-check URL)
-- Defaults to 'NO_VIN' for safe, privacy-preserving affiliate links.

ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "carVerticalVinMode" TEXT DEFAULT 'NO_VIN';
