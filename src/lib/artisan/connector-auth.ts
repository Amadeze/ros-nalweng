import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const CONNECTOR_TOKEN_PEPPER =
  process.env.ARTISAN_CONNECTOR_TOKEN_PEPPER || "";

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(CONNECTOR_TOKEN_PEPPER + token)
    .digest("hex");
}

export type AuthenticatedConnector = {
  connectorId: string;
  tenantId: string;
  machineId: string;
  installationId: string;
};

/**
 * Authenticate a connector request via Bearer token.
 * Returns the connector's tenantId and machineId, or null if invalid.
 */
export async function authenticateConnector(
  authorizationHeader: string | null,
): Promise<AuthenticatedConnector | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length);
  if (!token) return null;

  const tokenHash = hashToken(token);

  const connector = await prisma.artisanConnector.findUnique({
    where: { credentialHash: tokenHash },
    select: {
      id: true,
      tenantId: true,
      machineId: true,
      installationId: true,
      status: true,
      revokedAt: true,
    },
  });

  if (!connector) return null;
  if (connector.status === "REVOKED") return null;
  if (connector.revokedAt) return null;

  return {
    connectorId: connector.id,
    tenantId: connector.tenantId,
    machineId: connector.machineId,
    installationId: connector.installationId,
  };
}

/**
 * Hash a pairing code with pepper for storage.
 */
export function hashPairingCode(code: string): string {
  const pepper = process.env.ARTISAN_PAIRING_CODE_PEPPER || "";
  return crypto
    .createHash("sha256")
    .update(pepper + code)
    .digest("hex");
}

/**
 * Generate a random 6-digit numeric pairing code.
 */
export function generatePairingCode(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}

/**
 * Generate a random connector token (32 bytes hex).
 */
export function generateConnectorToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a connector token for storage.
 */
export function hashConnectorToken(token: string): string {
  return hashToken(token);
}
