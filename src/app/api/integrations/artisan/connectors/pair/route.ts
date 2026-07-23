import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, RateLimitError, requestIdentifier } from "@/lib/rate-limit";
import {
  hashPairingCode,
  generateConnectorToken,
  hashConnectorToken,
} from "@/lib/artisan/connector-auth";
import { PairConnectorRequestSchema } from "@/lib/artisan/types";
import {
  getRequestId,
  internalErrorResponse,
  logServerError,
} from "@/lib/api-observability";

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers);
  try {
    const ip = requestIdentifier(req.headers);
    await enforceRateLimit({
      scope: "artisan:connector-pair",
      identifier: ip,
      limit: 5,
      windowSeconds: 60,
    });

    const body = await req.json();
    const parsed = PairConnectorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Data tidak valid." } },
        { status: 400 },
      );
    }

    const { pairingCode, installationId, computerName, platform, appVersion } =
      parsed.data;

    // Lookup by hash
    const codeHash = hashPairingCode(pairingCode);
    const pairingRecord = await prisma.artisanPairingCode.findUnique({
      where: { codeHash },
      select: {
        id: true,
        tenantId: true,
        machineId: true,
        expiresAt: true,
        usedAt: true,
        machine: { select: { id: true, name: true } },
      },
    });

    if (!pairingRecord) {
      return NextResponse.json(
        { error: { code: "INVALID_PAIRING_CODE", message: "Kode pairing tidak valid." } },
        { status: 404 },
      );
    }

    if (pairingRecord.usedAt) {
      return NextResponse.json(
        { error: { code: "PAIRING_CODE_USED", message: "Kode pairing sudah digunakan." } },
        { status: 410 },
      );
    }

    if (new Date() > pairingRecord.expiresAt) {
      return NextResponse.json(
        { error: { code: "PAIRING_CODE_EXPIRED", message: "Kode pairing sudah expired." } },
        { status: 410 },
      );
    }

    // Check if installationId already paired — auto-revoke old connector
    const existingConnector = await prisma.artisanConnector.findUnique({
      where: { installationId },
      select: { id: true, revokedAt: true },
    });
    if (existingConnector && !existingConnector.revokedAt) {
      // Auto-revoke old connector, allow re-pairing
      await prisma.artisanConnector.update({
        where: { id: existingConnector.id },
        data: { status: "REVOKED", revokedAt: new Date() },
      });
    }

    // Generate credential
    const connectorToken = generateConnectorToken();
    const credentialHash = hashConnectorToken(connectorToken);

    const result = await prisma.$transaction(async (tx) => {
      // Create connector
      const connector = await tx.artisanConnector.create({
        data: {
          tenantId: pairingRecord.tenantId,
          machineId: pairingRecord.machineId,
          installationId,
          computerName,
          platform,
          appVersion,
          credentialHash,
          status: "ONLINE",
        },
      });

      // Mark pairing code as used
      await tx.artisanPairingCode.update({
        where: { id: pairingRecord.id },
        data: { usedAt: new Date() },
      });

      return connector;
    });

    // Note: connectorToken is shown once, never retrievable again.
    // encryptedCredential is stored in DB for future token rotation if needed.

    return NextResponse.json({
      connectorId: result.id,
      connectorToken,
      machine: {
        id: pairingRecord.machine.id,
        name: pairingRecord.machine.name,
      },
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: e.message } },
        { status: 429, headers: { "Retry-After": String(e.retryAfter) } },
      );
    }
    logServerError("artisan.connector-pair", e, { requestId });
    return internalErrorResponse(requestId, "Gagal melakukan pairing.");
  }
}
