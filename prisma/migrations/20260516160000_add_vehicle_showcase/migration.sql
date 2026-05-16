-- Separate "Aktuelna premium selekcija" from the homepage hero flag.
-- featured = homepage hero (enforced as max-1 server-side)
-- showcase = included in premium selection grid (multiple vehicles allowed)

ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "showcase" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Vehicle_showcase_idx" ON "Vehicle"("showcase");
