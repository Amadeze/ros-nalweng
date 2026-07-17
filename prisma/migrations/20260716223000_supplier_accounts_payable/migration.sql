CREATE TYPE "PurchasePaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

ALTER TABLE "purchases"
  ADD COLUMN "paymentStatus" "PurchasePaymentStatus" NOT NULL DEFAULT 'PAID',
  ADD COLUMN "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "dueDate" TIMESTAMP(3);

UPDATE "purchases"
SET
  "paidAmount" = CASE WHEN status = 'COMPLETED' THEN "totalCost" ELSE 0 END,
  "paymentStatus" = CASE WHEN status = 'COMPLETED' THEN 'PAID'::"PurchasePaymentStatus" ELSE 'UNPAID'::"PurchasePaymentStatus" END;

CREATE TABLE "supplier_payments" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
  "reference" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "voidReason" TEXT,
  "voidAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenantId" TEXT NOT NULL DEFAULT 'default',

  CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

INSERT INTO "supplier_payments" (
  "id",
  "code",
  "purchaseId",
  "amount",
  "method",
  "paidAt",
  "notes",
  "createdById",
  "createdAt",
  "tenantId"
)
SELECT
  'legacy_' || md5(p.id),
  'SPAY-LEGACY-' || upper(substr(md5(p.id), 1, 12)),
  p.id,
  p."totalCost",
  'CASH'::"PaymentMethod",
  p."receivedAt",
  'Migrasi pembayaran pembelian tunai lama',
  p."createdById",
  p."createdAt",
  p."tenantId"
FROM "purchases" p
WHERE p.status = 'COMPLETED' AND p."totalCost" > 0;

CREATE UNIQUE INDEX "supplier_payments_tenantId_code_key"
  ON "supplier_payments"("tenantId", "code");
CREATE INDEX "supplier_payments_tenantId_paidAt_idx"
  ON "supplier_payments"("tenantId", "paidAt");
CREATE INDEX "supplier_payments_tenantId_purchaseId_idx"
  ON "supplier_payments"("tenantId", "purchaseId");
CREATE INDEX "purchases_tenantId_paymentStatus_dueDate_idx"
  ON "purchases"("tenantId", "paymentStatus", "dueDate");

ALTER TABLE "supplier_payments"
  ADD CONSTRAINT "supplier_payments_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "supplier_payments_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "supplier_payments_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "supplier_payment_amount_positive"
    CHECK (amount > 0);

ALTER TABLE "purchases"
  ADD CONSTRAINT "purchase_payment_values_valid"
    CHECK (
      "paidAmount" >= 0
      AND "paidAmount" <= "totalCost" + 0.01
      AND (
        status <> 'COMPLETED'
        OR ("paymentStatus" = 'UNPAID' AND "paidAmount" <= 0.01)
        OR ("paymentStatus" = 'PARTIAL' AND "paidAmount" > 0.01 AND "paidAmount" < "totalCost" - 0.01)
        OR ("paymentStatus" = 'PAID' AND "paidAmount" >= "totalCost" - 0.01)
      )
    );
