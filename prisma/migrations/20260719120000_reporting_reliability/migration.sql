-- Tenant-local reporting boundaries
ALTER TABLE "tenants"
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta';

-- Durable execution history for scheduled operational jobs
CREATE TYPE "JobRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "job_runs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "jobName" TEXT NOT NULL,
    "runKey" TEXT NOT NULL,
    "status" "JobRunStatus" NOT NULL DEFAULT 'RUNNING',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "summary" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_runs_runKey_key" ON "job_runs"("runKey");
CREATE INDEX "job_runs_jobName_startedAt_idx" ON "job_runs"("jobName", "startedAt");
CREATE INDEX "job_runs_status_startedAt_idx" ON "job_runs"("status", "startedAt");
CREATE INDEX "job_runs_tenantId_startedAt_idx" ON "job_runs"("tenantId", "startedAt");

ALTER TABLE "job_runs"
ADD CONSTRAINT "job_runs_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reproducible daily operating report. One immutable logical report per tenant/day;
-- regeneration updates the same snapshot instead of creating duplicates.
CREATE TABLE "daily_brief_snapshots" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "daily_brief_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_brief_snapshots_tenantId_reportDate_key"
ON "daily_brief_snapshots"("tenantId", "reportDate");
CREATE INDEX "daily_brief_snapshots_tenantId_generatedAt_idx"
ON "daily_brief_snapshots"("tenantId", "generatedAt");

ALTER TABLE "daily_brief_snapshots"
ADD CONSTRAINT "daily_brief_snapshots_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
