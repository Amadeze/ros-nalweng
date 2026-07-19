ALTER TABLE "products"
ADD COLUMN "sourceGreenBeanId" TEXT;

-- Preserve existing identity where the RB name equals the GB name after
-- inventory words such as "Green Bean" / "GB" are removed. If duplicate
-- legacy RB rows exist for the same level, link only the oldest one.
WITH exact_candidates AS (
  SELECT DISTINCT ON (gb."tenantId", gb."id", rb."roastLevel")
    rb."id" AS "rbId",
    gb."id" AS "gbId"
  FROM "products" rb
  JOIN "products" gb
    ON gb."tenantId" = rb."tenantId"
   AND gb."type" = 'GREEN_BEAN'
  WHERE rb."type" = 'ROASTED_BEAN'
    AND rb."roastLevel" IS NOT NULL
    AND lower(trim(regexp_replace(
      regexp_replace(gb."name", '\m(green[[:space:]]*beans?|gb|mentah)\M', ' ', 'gi'),
      '[|·—–_-]+', ' ', 'g'
    ))) = lower(trim(rb."name"))
  ORDER BY gb."tenantId", gb."id", rb."roastLevel", rb."createdAt", rb."id"
)
UPDATE "products" rb
SET "sourceGreenBeanId" = candidate."gbId"
FROM exact_candidates candidate
WHERE rb."id" = candidate."rbId";

-- A unique origin is a safe fallback for legacy labels such as GB "DAMPIT"
-- and RB "Robusta Dampit". Ambiguous origins are deliberately left unlinked.
WITH origin_candidates AS (
  SELECT DISTINCT ON (gb."tenantId", gb."id", rb."roastLevel")
    rb."id" AS "rbId",
    gb."id" AS "gbId"
  FROM "products" rb
  JOIN "products" gb
    ON gb."tenantId" = rb."tenantId"
   AND gb."type" = 'GREEN_BEAN'
   AND nullif(lower(trim(gb."origin")), '') = nullif(lower(trim(rb."origin")), '')
  WHERE rb."type" = 'ROASTED_BEAN'
    AND rb."roastLevel" IS NOT NULL
    AND rb."sourceGreenBeanId" IS NULL
    AND (
      SELECT count(*)
      FROM "products" same_origin
      WHERE same_origin."tenantId" = gb."tenantId"
        AND same_origin."type" = 'GREEN_BEAN'
        AND nullif(lower(trim(same_origin."origin")), '') = nullif(lower(trim(gb."origin")), '')
    ) = 1
  ORDER BY gb."tenantId", gb."id", rb."roastLevel", rb."createdAt", rb."id"
)
UPDATE "products" rb
SET "sourceGreenBeanId" = candidate."gbId"
FROM origin_candidates candidate
WHERE rb."id" = candidate."rbId";

CREATE UNIQUE INDEX "products_tenantId_sourceGreenBeanId_roastLevel_key"
ON "products"("tenantId", "sourceGreenBeanId", "roastLevel");

CREATE INDEX "products_tenantId_sourceGreenBeanId_idx"
ON "products"("tenantId", "sourceGreenBeanId");

ALTER TABLE "products"
ADD CONSTRAINT "products_sourceGreenBeanId_fkey"
FOREIGN KEY ("sourceGreenBeanId") REFERENCES "products"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
