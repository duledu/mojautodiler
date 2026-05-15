-- Add VAT/PDV display mode for vehicle prices.

CREATE TYPE "VatMode" AS ENUM ('INCLUDED', 'EXCLUDED', 'NONE');

ALTER TABLE "Vehicle"
ADD COLUMN "vatMode" "VatMode" NOT NULL DEFAULT 'NONE';
