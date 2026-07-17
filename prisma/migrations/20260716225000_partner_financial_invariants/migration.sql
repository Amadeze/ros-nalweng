ALTER TABLE "capital_transactions"
  ADD CONSTRAINT "withdrawal_requires_partner"
    CHECK (type <> 'WITHDRAWAL' OR "partnerId" IS NOT NULL);

CREATE UNIQUE INDEX "profit_distributions_tenantId_partnerId_year_month_key"
  ON "profit_distributions"("tenantId", "partnerId", "year", "month");
