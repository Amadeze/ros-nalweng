-- AlterTable: Add roastId column to ChildRoastingBatch
ALTER TABLE "child_roasting_batches" ADD COLUMN "roastId" TEXT;

-- AlterTable: Add machineId column to ParentRoastingBatch
ALTER TABLE "parent_roasting_batches" ADD COLUMN "machineId" TEXT;
