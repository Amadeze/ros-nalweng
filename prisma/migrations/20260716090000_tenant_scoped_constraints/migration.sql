-- DropIndex
DROP INDEX "capital_transactions_code_key";

-- DropIndex
DROP INDEX "customers_code_key";

-- DropIndex
DROP INDEX "expenses_category_idx";

-- DropIndex
DROP INDEX "expenses_date_idx";

-- DropIndex
DROP INDEX "inventory_ledger_packagingId_createdAt_idx";

-- DropIndex
DROP INDEX "inventory_ledger_productId_createdAt_idx";

-- DropIndex
DROP INDEX "inventory_ledger_refType_refId_idx";

-- DropIndex
DROP INDEX "invoices_code_key";

-- DropIndex
DROP INDEX "packagings_code_key";

-- DropIndex
DROP INDEX "parent_roasting_batches_code_key";

-- DropIndex
DROP INDEX "payments_code_key";

-- DropIndex
DROP INDEX "production_batches_code_key";

-- DropIndex
DROP INDEX "products_code_key";

-- DropIndex
DROP INDEX "profit_distributions_code_key";

-- DropIndex
DROP INDEX "purchases_code_key";

-- DropIndex
DROP INDEX "recipes_code_key";

-- DropIndex
DROP INDEX "suppliers_code_key";

-- CreateIndex
CREATE INDEX "capital_transactions_tenantId_transactionDate_idx" ON "capital_transactions"("tenantId", "transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "capital_transactions_tenantId_code_key" ON "capital_transactions"("tenantId", "code");

-- CreateIndex
CREATE INDEX "customers_tenantId_isActive_idx" ON "customers"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenantId_code_key" ON "customers"("tenantId", "code");

-- CreateIndex
CREATE INDEX "expenses_tenantId_date_idx" ON "expenses"("tenantId", "date");

-- CreateIndex
CREATE INDEX "expenses_tenantId_category_idx" ON "expenses"("tenantId", "category");

-- CreateIndex
CREATE INDEX "inventory_ledger_tenantId_productId_createdAt_idx" ON "inventory_ledger"("tenantId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_ledger_tenantId_packagingId_createdAt_idx" ON "inventory_ledger"("tenantId", "packagingId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_ledger_tenantId_refType_refId_idx" ON "inventory_ledger"("tenantId", "refType", "refId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_status_issuedAt_idx" ON "invoices"("tenantId", "status", "issuedAt");

-- CreateIndex
CREATE INDEX "invoices_tenantId_customerId_issuedAt_idx" ON "invoices"("tenantId", "customerId", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_code_key" ON "invoices"("tenantId", "code");

-- CreateIndex
CREATE INDEX "packagings_tenantId_isActive_idx" ON "packagings"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "packagings_tenantId_code_key" ON "packagings"("tenantId", "code");

-- CreateIndex
CREATE INDEX "parent_roasting_batches_tenantId_status_createdAt_idx" ON "parent_roasting_batches"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "parent_roasting_batches_tenantId_code_key" ON "parent_roasting_batches"("tenantId", "code");

-- CreateIndex
CREATE INDEX "partners_tenantId_isActive_idx" ON "partners"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "payments_tenantId_paidAt_idx" ON "payments"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "payments_tenantId_invoiceId_idx" ON "payments"("tenantId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tenantId_code_key" ON "payments"("tenantId", "code");

-- CreateIndex
CREATE INDEX "production_batches_tenantId_status_producedAt_idx" ON "production_batches"("tenantId", "status", "producedAt");

-- CreateIndex
CREATE UNIQUE INDEX "production_batches_tenantId_code_key" ON "production_batches"("tenantId", "code");

-- CreateIndex
CREATE INDEX "products_tenantId_type_isActive_idx" ON "products"("tenantId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_code_key" ON "products"("tenantId", "code");

-- CreateIndex
CREATE INDEX "profit_distributions_tenantId_year_month_idx" ON "profit_distributions"("tenantId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "profit_distributions_tenantId_code_key" ON "profit_distributions"("tenantId", "code");

-- CreateIndex
CREATE INDEX "purchases_tenantId_receivedAt_idx" ON "purchases"("tenantId", "receivedAt");

-- CreateIndex
CREATE INDEX "purchases_tenantId_status_idx" ON "purchases"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_tenantId_code_key" ON "purchases"("tenantId", "code");

-- CreateIndex
CREATE INDEX "recipes_tenantId_isActive_idx" ON "recipes"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_tenantId_code_key" ON "recipes"("tenantId", "code");

-- CreateIndex
CREATE INDEX "suppliers_tenantId_isActive_idx" ON "suppliers"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenantId_code_key" ON "suppliers"("tenantId", "code");
