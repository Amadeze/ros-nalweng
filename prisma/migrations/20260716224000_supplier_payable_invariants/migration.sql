ALTER TABLE "purchases"
  ADD CONSTRAINT "purchase_credit_requires_due_date"
    CHECK (
      status <> 'COMPLETED'
      OR "paymentStatus" = 'PAID'
      OR "dueDate" IS NOT NULL
    ),
  ADD CONSTRAINT "void_purchase_has_no_payment_balance"
    CHECK (status <> 'VOID' OR "paidAmount" <= 0.01);
