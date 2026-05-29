-- AddColumn: onSale Boolean @default(false) on Vehicle
ALTER TABLE "Vehicle" ADD COLUMN "onSale" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Vehicle_onSale_idx" ON "Vehicle"("onSale");
