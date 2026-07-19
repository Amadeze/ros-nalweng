-- Prevent retried receiving commands from recording stock and payables twice.
ALTER TABLE "purchases"
ADD COLUMN "operationKey" TEXT;

CREATE UNIQUE INDEX "purchases_tenantId_operationKey_key"
ON "purchases"("tenantId", "operationKey");
