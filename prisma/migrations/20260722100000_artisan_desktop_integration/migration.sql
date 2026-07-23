-- CreateEnum
CREATE TYPE "ArtisanConnectorStatus" AS ENUM ('ONLINE', 'OFFLINE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ArtisanImportStatus" AS ENUM ('UPLOADED', 'PARSING', 'IMPORTED', 'DUPLICATE', 'FAILED');

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_pairing_codes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artisan_pairing_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_connectors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "computerName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "credentialHash" TEXT NOT NULL,
    "status" "ArtisanConnectorStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastSeenAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artisan_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_roast_imports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" "ArtisanImportStatus" NOT NULL DEFAULT 'UPLOADED',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "roastId" TEXT,
    "fileModifiedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3),

    CONSTRAINT "artisan_roast_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machines_tenantId_name_key" ON "machines"("tenantId", "name");

-- CreateIndex
CREATE INDEX "machines_tenantId_isActive_key" ON "machines"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_pairing_codes_codeHash_key" ON "artisan_pairing_codes"("codeHash");

-- CreateIndex
CREATE INDEX "artisan_pairing_codes_tenantId_idx" ON "artisan_pairing_codes"("tenantId");

-- CreateIndex
CREATE INDEX "artisan_pairing_codes_codeHash_idx" ON "artisan_pairing_codes"("codeHash");

-- CreateIndex
CREATE INDEX "artisan_pairing_codes_expiresAt_idx" ON "artisan_pairing_codes"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_connectors_installationId_key" ON "artisan_connectors"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_connectors_credentialHash_key" ON "artisan_connectors"("credentialHash");

-- CreateIndex
CREATE INDEX "artisan_connectors_tenantId_idx" ON "artisan_connectors"("tenantId");

-- CreateIndex
CREATE INDEX "artisan_connectors_machineId_idx" ON "artisan_connectors"("machineId");

-- CreateIndex
CREATE INDEX "artisan_connectors_credentialHash_idx" ON "artisan_connectors"("credentialHash");

-- CreateIndex
CREATE INDEX "artisan_connectors_lastSeenAt_idx" ON "artisan_connectors"("lastSeenAt");

-- CreateIndex
CREATE INDEX "artisan_connectors_status_idx" ON "artisan_connectors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "artisan_roast_imports_tenantId_machineId_fileHash_key" ON "artisan_roast_imports"("tenantId", "machineId", "fileHash");

-- CreateIndex
CREATE INDEX "artisan_roast_imports_tenantId_idx" ON "artisan_roast_imports"("tenantId");

-- CreateIndex
CREATE INDEX "artisan_roast_imports_machineId_idx" ON "artisan_roast_imports"("machineId");

-- CreateIndex
CREATE INDEX "artisan_roast_imports_connectorId_idx" ON "artisan_roast_imports"("connectorId");

-- CreateIndex
CREATE INDEX "artisan_roast_imports_status_idx" ON "artisan_roast_imports"("status");

-- CreateIndex
CREATE INDEX "artisan_roast_imports_uploadedAt_idx" ON "artisan_roast_imports"("uploadedAt");

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_pairing_codes" ADD CONSTRAINT "artisan_pairing_codes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_pairing_codes" ADD CONSTRAINT "artisan_pairing_codes_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_connectors" ADD CONSTRAINT "artisan_connectors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_connectors" ADD CONSTRAINT "artisan_connectors_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_roast_imports" ADD CONSTRAINT "artisan_roast_imports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_roast_imports" ADD CONSTRAINT "artisan_roast_imports_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_roast_imports" ADD CONSTRAINT "artisan_roast_imports_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "artisan_connectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
