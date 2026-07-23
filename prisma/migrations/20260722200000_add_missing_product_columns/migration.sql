-- AlterTable: Add missing columns to Product table
-- These columns exist in schema.prisma but were not migrated

ALTER TABLE "products" ADD COLUMN "coffeeSpecies" TEXT;
ALTER TABLE "products" ADD COLUMN "priceSilver" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "priceGold" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "stockUnit" INTEGER DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "stockKg" DECIMAL(10,3) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "lastHpp" DECIMAL(12,2);
ALTER TABLE "products" ADD COLUMN "avgCostPerKg" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "reorderAlertEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN "leadTimeDays" INTEGER DEFAULT 7;
ALTER TABLE "products" ADD COLUMN "safetyStockQuantity" DECIMAL(10,3) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "reorderLookbackDays" INTEGER DEFAULT 30;
ALTER TABLE "products" ADD COLUMN "shelfLifeDays" INTEGER;
