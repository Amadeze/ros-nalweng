ALTER TYPE "LedgerRefType" ADD VALUE 'SAMPLE_RB_OUT';
ALTER TYPE "LedgerRefType" ADD VALUE 'SAMPLE_FG_OUT';
ALTER TYPE "LedgerRefType" ADD VALUE 'SAMPLE_PKG_OUT';

CREATE TABLE "sample_usages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "operationKey" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "packCount" INTEGER NOT NULL,
    "totalGrams" DECIMAL(12,3) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "recipient" TEXT,
    "notes" TEXT,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "voidReason" TEXT,
    "voidAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    CONSTRAINT "sample_usages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sample_usage_components" (
    "id" TEXT NOT NULL,
    "sampleUsageId" TEXT NOT NULL,
    "productId" TEXT,
    "packagingId" TEXT,
    "label" TEXT NOT NULL,
    "quantityKg" DECIMAL(10,3),
    "quantityUnit" INTEGER,
    "ratioPercent" DECIMAL(5,2),
    "unitCost" DECIMAL(14,4) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    CONSTRAINT "sample_usage_components_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sample_usages_tenantId_code_key" ON "sample_usages"("tenantId", "code");
CREATE UNIQUE INDEX "sample_usages_tenantId_operationKey_key" ON "sample_usages"("tenantId", "operationKey");
CREATE INDEX "sample_usages_tenantId_givenAt_status_idx" ON "sample_usages"("tenantId", "givenAt", "status");
CREATE INDEX "sample_usage_components_tenantId_sampleUsageId_idx" ON "sample_usage_components"("tenantId", "sampleUsageId");
CREATE INDEX "sample_usage_components_tenantId_productId_idx" ON "sample_usage_components"("tenantId", "productId");
CREATE INDEX "sample_usage_components_tenantId_packagingId_idx" ON "sample_usage_components"("tenantId", "packagingId");

ALTER TABLE "sample_usages" ADD CONSTRAINT "sample_usages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sample_usages" ADD CONSTRAINT "sample_usages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sample_usage_components" ADD CONSTRAINT "sample_usage_components_sampleUsageId_fkey" FOREIGN KEY ("sampleUsageId") REFERENCES "sample_usages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sample_usage_components" ADD CONSTRAINT "sample_usage_components_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sample_usage_components" ADD CONSTRAINT "sample_usage_components_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES "packagings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sample_usage_components" ADD CONSTRAINT "sample_usage_components_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
