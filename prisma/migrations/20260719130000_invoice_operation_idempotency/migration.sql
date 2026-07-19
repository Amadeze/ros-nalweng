-- Prevent a retried or double-clicked sale command from creating two invoices.
ALTER TABLE "invoices"
ADD COLUMN "operationKey" TEXT;

CREATE UNIQUE INDEX "invoices_tenantId_operationKey_key"
ON "invoices"("tenantId", "operationKey");
