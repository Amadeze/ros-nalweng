CREATE TABLE "reminder_deliveries" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "reminderDate" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "error" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reminder_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reminder_deliveries_tenantId_invoiceId_channel_reminderDate_key"
  ON "reminder_deliveries"("tenantId", "invoiceId", "channel", "reminderDate");
CREATE INDEX "reminder_deliveries_tenantId_reminderDate_status_idx"
  ON "reminder_deliveries"("tenantId", "reminderDate", "status");

ALTER TABLE "reminder_deliveries"
  ADD CONSTRAINT "reminder_deliveries_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "reminder_deliveries_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
