import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Violation = { check: string; count: number };

try {
  const tenantRelationViolations = await prisma.$queryRaw<Violation[]>`
    SELECT 'purchase_supplier' AS check, COUNT(*)::int AS count
    FROM purchases x JOIN suppliers y ON y.id = x."supplierId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'purchase_product', COUNT(*)::int
    FROM purchases x JOIN products y ON y.id = x."productId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'purchase_packaging', COUNT(*)::int
    FROM purchases x JOIN packagings y ON y.id = x."packagingId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'roasting_input_product', COUNT(*)::int
    FROM parent_roasting_batches x JOIN products y ON y.id = x."inputProductId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'roasting_output_product', COUNT(*)::int
    FROM parent_roasting_batches x JOIN products y ON y.id = x."outputProductId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'product_source_green_bean', COUNT(*)::int
    FROM products x JOIN products y ON y.id = x."sourceGreenBeanId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'production_output_product', COUNT(*)::int
    FROM production_batches x JOIN products y ON y.id = x."outputProductId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'production_packaging', COUNT(*)::int
    FROM production_batches x JOIN packagings y ON y.id = x."packagingId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'invoice_customer', COUNT(*)::int
    FROM invoices x JOIN customers y ON y.id = x."customerId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'invoice_item_product', COUNT(*)::int
    FROM invoice_items x
    JOIN invoices i ON i.id = x."invoiceId"
    JOIN products p ON p.id = x."productId"
    WHERE i."tenantId" <> p."tenantId"
    UNION ALL
    SELECT 'payment_invoice', COUNT(*)::int
    FROM payments x JOIN invoices y ON y.id = x."invoiceId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'supplier_payment_purchase', COUNT(*)::int
    FROM supplier_payments x JOIN purchases y ON y.id = x."purchaseId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'ledger_product', COUNT(*)::int
    FROM inventory_ledger x JOIN products y ON y.id = x."productId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'ledger_packaging', COUNT(*)::int
    FROM inventory_ledger x JOIN packagings y ON y.id = x."packagingId"
    WHERE x."tenantId" <> y."tenantId"
    UNION ALL
    SELECT 'reminder_invoice', COUNT(*)::int
    FROM reminder_deliveries x JOIN invoices y ON y.id = x."invoiceId"
    WHERE x."tenantId" <> y."tenantId"
  `;

  const financialViolations = await prisma.$queryRaw<Violation[]>`
    SELECT 'invoice_subtotal_mismatch' AS check, COUNT(*)::int AS count
    FROM (
      SELECT i.id
      FROM invoices i
      LEFT JOIN invoice_items ii ON ii."invoiceId" = i.id
      GROUP BY i.id
      HAVING ABS(i.subtotal - COALESCE(SUM(ii.subtotal), 0)) > 0.01
    ) mismatches
    UNION ALL
    SELECT 'invoice_grand_total_mismatch', COUNT(*)::int
    FROM invoices
    WHERE ABS("grandTotal" - (subtotal - discount + tax + "shippingCost")) > 0.01
    UNION ALL
    SELECT 'invoice_paid_amount_mismatch', COUNT(*)::int
    FROM (
      SELECT i.id
      FROM invoices i
      LEFT JOIN payments p ON p."invoiceId" = i.id AND p."voidAt" IS NULL
      GROUP BY i.id
      HAVING ABS(i."paidAmount" - COALESCE(SUM(p.amount), 0)) > 0.01
    ) mismatches
    UNION ALL
    SELECT 'invoice_overpaid', COUNT(*)::int
    FROM invoices
    WHERE "paidAmount" > "grandTotal" + 0.01
    UNION ALL
    SELECT 'invoice_payment_status_mismatch', COUNT(*)::int
    FROM invoices
    WHERE
      (status = 'PAID' AND "paidAmount" < "grandTotal" - 0.01)
      OR (status = 'PARTIAL' AND ("paidAmount" <= 0 OR "paidAmount" >= "grandTotal" - 0.01))
      OR (status = 'ISSUED' AND "paidAmount" > 0.01)
    UNION ALL
    SELECT 'purchase_paid_amount_mismatch', COUNT(*)::int
    FROM (
      SELECT p.id
      FROM purchases p
      LEFT JOIN supplier_payments sp
        ON sp."purchaseId" = p.id AND sp."voidAt" IS NULL
      GROUP BY p.id
      HAVING ABS(p."paidAmount" - COALESCE(SUM(sp.amount), 0)) > 0.01
    ) mismatches
    UNION ALL
    SELECT 'purchase_overpaid', COUNT(*)::int
    FROM purchases
    WHERE "paidAmount" > "totalCost" + 0.01
    UNION ALL
    SELECT 'purchase_payment_status_mismatch', COUNT(*)::int
    FROM purchases
    WHERE status = 'COMPLETED' AND (
      ("paymentStatus" = 'PAID' AND "paidAmount" < "totalCost" - 0.01)
      OR ("paymentStatus" = 'PARTIAL' AND ("paidAmount" <= 0.01 OR "paidAmount" >= "totalCost" - 0.01))
      OR ("paymentStatus" = 'UNPAID' AND "paidAmount" > 0.01)
    )
    UNION ALL
    SELECT 'purchase_credit_missing_due_date', COUNT(*)::int
    FROM purchases
    WHERE status = 'COMPLETED'
      AND "paymentStatus" <> 'PAID'
      AND "dueDate" IS NULL
    UNION ALL
    SELECT 'duplicate_sent_reminder', COUNT(*)::int
    FROM (
      SELECT "tenantId", "invoiceId", channel, "reminderDate"
      FROM reminder_deliveries
      WHERE status = 'SENT'
      GROUP BY "tenantId", "invoiceId", channel, "reminderDate"
      HAVING COUNT(*) > 1
    ) duplicates
  `;

  const inventoryViolations = await prisma.$queryRaw<Violation[]>`
    SELECT 'negative_product_kg' AS check, COUNT(*)::int AS count
    FROM products WHERE "stockKg" < 0
    UNION ALL
    SELECT 'negative_product_unit', COUNT(*)::int
    FROM products WHERE "stockUnit" < 0
    UNION ALL
    SELECT 'negative_packaging_unit', COUNT(*)::int
    FROM packagings WHERE "stockUnit" < 0
    UNION ALL
    SELECT 'ledger_invalid_target', COUNT(*)::int
    FROM inventory_ledger
    WHERE ("productId" IS NULL) = ("packagingId" IS NULL)
    UNION ALL
    SELECT 'ledger_invalid_quantity', COUNT(*)::int
    FROM inventory_ledger
    WHERE
      COALESCE("quantityKg", 0) < 0
      OR COALESCE("quantityUnit", 0) < 0
      OR (COALESCE("quantityKg", 0) = 0 AND COALESCE("quantityUnit", 0) = 0)
    UNION ALL
    SELECT 'finished_goods_hpp_cache_mismatch', COUNT(*)::int
    FROM products p
    LEFT JOIN LATERAL (
      SELECT pb."hppPerUnit"
      FROM production_batches pb
      WHERE pb."outputProductId" = p.id AND pb.status = 'COMPLETED'
      ORDER BY pb."producedAt" DESC, pb."createdAt" DESC
      LIMIT 1
    ) latest ON TRUE
    WHERE p.type = 'FINISHED_GOODS'
      AND p."lastHpp" IS DISTINCT FROM latest."hppPerUnit"
  `;

  const operationalViolations = await prisma.$queryRaw<Violation[]>`
    SELECT 'roasted_product_invalid_source' AS check, COUNT(*)::int AS count
    FROM products rb
    JOIN products gb ON gb.id = rb."sourceGreenBeanId"
    WHERE rb.type <> 'ROASTED_BEAN'
      OR gb.type <> 'GREEN_BEAN'
      OR rb."roastLevel" IS NULL
    UNION ALL
    SELECT 'completed_purchase_ledger_mismatch', COUNT(*)::int
    FROM purchases p
    WHERE p.status = 'COMPLETED'
      AND (
        SELECT COUNT(*)
        FROM inventory_ledger il
        WHERE il."refId" = p.id
          AND il."entryType" = 'IN'
          AND il."refType" IN ('PURCHASE_GB', 'PURCHASE_PKG')
      ) <> 1
    UNION ALL
    SELECT 'completed_roasting_ledger_mismatch', COUNT(*)::int
    FROM parent_roasting_batches rb
    WHERE rb.status = 'COMPLETED'
      AND (
        ABS(COALESCE((
          SELECT SUM(il."quantityKg")
          FROM inventory_ledger il
          WHERE il."refId" = rb.id
            AND il."refType" = 'ROASTING_GB_OUT'
            AND il."entryType" = 'OUT'
            AND il."productId" = rb."inputProductId"
        ), 0) - rb."targetWeightKg") > 0.001
        OR
        ABS(COALESCE((
          SELECT SUM(il."quantityKg")
          FROM inventory_ledger il
          WHERE il."refId" = rb.id
            AND il."refType" = 'ROASTING_RB_IN'
            AND il."entryType" = 'IN'
            AND il."productId" = rb."outputProductId"
        ), 0) - rb."actualOutputKg") > 0.001
      )
    UNION ALL
    SELECT 'pending_roasting_ledger_mismatch', COUNT(*)::int
    FROM parent_roasting_batches rb
    WHERE rb.status = 'PENDING'
      AND (
        ABS(COALESCE((
          SELECT SUM(il."quantityKg")
          FROM inventory_ledger il
          WHERE il."refId" = rb.id
            AND il."refType" = 'ROASTING_GB_OUT'
            AND il."entryType" = 'OUT'
        ), 0) - rb."targetWeightKg") > 0.001
        OR EXISTS (
          SELECT 1
          FROM inventory_ledger il
          WHERE il."refId" = rb.id AND il."refType" = 'ROASTING_RB_IN'
        )
      )
    UNION ALL
    SELECT 'completed_production_ledger_mismatch', COUNT(*)::int
    FROM production_batches pb
    WHERE pb.status = 'COMPLETED'
      AND (
        ABS(COALESCE((
          SELECT SUM(il."quantityKg")
          FROM inventory_ledger il
          WHERE il."refId" = pb.id
            AND il."refType" = 'PRODUCTION_RB_OUT'
            AND il."entryType" = 'OUT'
        ), 0) - pb."totalRbUsedKg") > 0.001
        OR COALESCE((
          SELECT SUM(il."quantityUnit")
          FROM inventory_ledger il
          WHERE il."refId" = pb.id
            AND il."refType" = 'PRODUCTION_PKG_OUT'
            AND il."entryType" = 'OUT'
            AND il."packagingId" = pb."packagingId"
        ), 0) <> pb."unitsProduced"
        OR COALESCE((
          SELECT SUM(il."quantityUnit")
          FROM inventory_ledger il
          WHERE il."refId" = pb.id
            AND il."refType" = 'PRODUCTION_FG_IN'
            AND il."entryType" = 'IN'
            AND il."productId" = pb."outputProductId"
        ), 0) <> pb."unitsProduced"
      )
  `;

  const violations = [
    ...tenantRelationViolations,
    ...financialViolations,
    ...inventoryViolations,
    ...operationalViolations,
  ].filter((item) => item.count > 0);

  console.log(JSON.stringify({ violations }, null, 2));
  if (violations.length > 0) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
