ALTER TABLE "parent_roasting_batches"
ADD COLUMN "operationKey" TEXT;

CREATE UNIQUE INDEX "parent_roasting_batches_tenantId_operationKey_key"
ON "parent_roasting_batches"("tenantId", "operationKey");
