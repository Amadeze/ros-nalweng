ALTER TABLE "expenses"
  ADD COLUMN "voidReason" TEXT,
  ADD COLUMN "voidAt" TIMESTAMP(3);

CREATE INDEX "expenses_tenantId_voidAt_date_idx"
  ON "expenses"("tenantId", "voidAt", "date");
