ALTER TABLE "products"
  ADD CONSTRAINT "products_stock_nonnegative"
  CHECK ("stockKg" >= 0 AND "stockUnit" >= 0);

ALTER TABLE "packagings"
  ADD CONSTRAINT "packagings_stock_nonnegative"
  CHECK ("stockUnit" >= 0);

ALTER TABLE "inventory_ledger"
  ADD CONSTRAINT "inventory_ledger_exactly_one_target"
  CHECK (("productId" IS NULL) <> ("packagingId" IS NULL)),
  ADD CONSTRAINT "inventory_ledger_exactly_one_positive_quantity"
  CHECK (
    ("quantityKg" IS NOT NULL AND "quantityKg" > 0 AND "quantityUnit" IS NULL)
    OR
    ("quantityUnit" IS NOT NULL AND "quantityUnit" > 0 AND "quantityKg" IS NULL)
  );

ALTER TABLE "parent_roasting_batches"
  ADD CONSTRAINT "roasting_target_positive"
  CHECK ("targetWeightKg" > 0),
  ADD CONSTRAINT "roasting_output_valid"
  CHECK (
    "actualOutputKg" IS NULL
    OR ("actualOutputKg" > 0 AND "actualOutputKg" < "targetWeightKg")
  ),
  ADD CONSTRAINT "roasting_completed_has_output"
  CHECK (status <> 'COMPLETED' OR "actualOutputKg" IS NOT NULL);

ALTER TABLE "production_batches"
  ADD CONSTRAINT "production_values_positive"
  CHECK ("unitsProduced" > 0 AND "totalRbUsedKg" > 0 AND "hppPerUnit" >= 0);

ALTER TABLE "invoice_items"
  ADD CONSTRAINT "invoice_item_values_valid"
  CHECK (
    quantity > 0
    AND "unitPrice" >= 0
    AND discount >= 0
    AND discount <= "unitPrice"
    AND subtotal >= 0
    AND hpp >= 0
  );

ALTER TABLE "invoices"
  ADD CONSTRAINT "invoice_values_valid"
  CHECK (
    subtotal >= 0
    AND discount >= 0
    AND tax >= 0
    AND "shippingCost" >= 0
    AND "grandTotal" >= 0
    AND "paidAmount" >= 0
    AND "paidAmount" <= "grandTotal" + 0.01
  );

ALTER TABLE "payments"
  ADD CONSTRAINT "payment_amount_positive"
  CHECK (amount > 0);

ALTER TABLE "expenses"
  ADD CONSTRAINT "expense_amount_positive"
  CHECK (amount > 0);

ALTER TABLE "capital_transactions"
  ADD CONSTRAINT "capital_transaction_amount_positive"
  CHECK (amount > 0);

ALTER TABLE "profit_distributions"
  ADD CONSTRAINT "profit_distribution_values_valid"
  CHECK ("netProfit" > 0 AND amount >= 0);
