ALTER TABLE "production_batches"
ADD COLUMN "operationKey" TEXT;

CREATE UNIQUE INDEX "production_batches_tenantId_operationKey_key"
ON "production_batches"("tenantId", "operationKey");
