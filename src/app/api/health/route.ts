import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  decryptCredential,
  isEncryptedCredential,
} from "@/lib/credentials";
import { getRequestId, logServerError } from "@/lib/api-observability";
import { getCurrentDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const startedAt = performance.now();
  const missingConfiguration =
    process.env.NODE_ENV === "production"
      ? [
          "SESSION_SECRET",
          "CREDENTIAL_ENCRYPTION_KEY",
          "APP_URL",
          "CRON_SECRET",
          "SUPABASE_URL",
          "SUPABASE_SERVICE_ROLE_KEY",
          "SUPABASE_STORAGE_BUCKET",
        ].filter((name) => !process.env[name])
      : [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    const encryptedCredentials = await prisma.tenant.findMany({
      where: { midtransServerKey: { startsWith: "enc:v1:" } },
      select: { midtransServerKey: true },
    });
    let credentialDecryptFailures = 0;
    for (const tenant of encryptedCredentials) {
      if (!tenant.midtransServerKey || !isEncryptedCredential(tenant.midtransServerKey)) continue;
      try {
        decryptCredential(tenant.midtransServerKey);
      } catch {
        credentialDecryptFailures += 1;
      }
    }
    const hasMissingConfig = missingConfiguration.length > 0;
    const hasDecryptFailures = credentialDecryptFailures > 0;
    const ready = !hasMissingConfig && !hasDecryptFailures;
    
    return NextResponse.json(
      {
        status: ready ? "ok" : "degraded",
        database: "reachable",
        configuration: ready ? "ready" : "incomplete",
        timestamp: getCurrentDate().toISOString(),
        latencyMs: Math.round(performance.now() - startedAt),
        version: process.env.npm_package_version || "unknown",
        release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null,
      },
      {
        status: ready ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    logServerError("health.readiness", error, { requestId });
    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        timestamp: getCurrentDate().toISOString(),
        requestId,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
        },
      },
    );
  }
}
