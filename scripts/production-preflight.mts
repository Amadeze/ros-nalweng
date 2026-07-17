import { readdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  decryptCredential,
  isEncryptedCredential,
} from "../src/lib/credentials";

const requiredEnvironment = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SESSION_SECRET",
  "CREDENTIAL_ENCRYPTION_KEY",
  "APP_URL",
  "CRON_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
] as const;

const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
const warnings: string[] = [];
if (process.env.APP_URL && !process.env.APP_URL.startsWith("https://")) {
  warnings.push("APP_URL should use HTTPS in production.");
}
if (!process.env.RESEND_API_KEY) warnings.push("Email delivery is disabled.");
if (!process.env.MIDTRANS_SERVER_KEY) warnings.push("SaaS subscription checkout is disabled.");
if (!process.env.WA_API_KEY) warnings.push("WhatsApp delivery is disabled.");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error(JSON.stringify({ ready: false, missingEnvironment, warnings }, null, 2));
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  await prisma.$queryRaw`SELECT 1`;
  const migrationDirectories = (await readdir(path.join(process.cwd(), "prisma", "migrations"), {
    withFileTypes: true,
  }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const applied = await prisma.$queryRaw<Array<{
    migration_name: string;
    finished_at: Date | null;
    rolled_back_at: Date | null;
  }>>`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
  `;
  const completed = new Set(
    applied
      .filter((migration) => migration.finished_at && !migration.rolled_back_at)
      .map((migration) => migration.migration_name),
  );
  const unappliedMigrations = migrationDirectories.filter((name) => !completed.has(name));
  const failedMigrations = applied
    .filter((migration) => !migration.finished_at && !migration.rolled_back_at)
    .map((migration) => migration.migration_name);
  const encryptedTenantCredentials = await prisma.tenant.findMany({
    where: { midtransServerKey: { startsWith: "enc:v1:" } },
    select: { midtransServerKey: true },
  });
  let credentialDecryptFailures = 0;
  for (const tenant of encryptedTenantCredentials) {
    if (!tenant.midtransServerKey || !isEncryptedCredential(tenant.midtransServerKey)) continue;
    try {
      decryptCredential(tenant.midtransServerKey);
    } catch {
      credentialDecryptFailures += 1;
    }
  }
  const ready =
    missingEnvironment.length === 0 &&
    unappliedMigrations.length === 0 &&
    failedMigrations.length === 0 &&
    credentialDecryptFailures === 0;

  console.log(JSON.stringify({
    ready,
    database: "reachable",
    migrationCount: migrationDirectories.length,
    unappliedMigrations,
    failedMigrations,
    encryptedCredentialCheck: {
      inspected: encryptedTenantCredentials.length,
      failures: credentialDecryptFailures,
    },
    missingEnvironment,
    integrations: {
      email: Boolean(process.env.RESEND_API_KEY),
      subscriptionMidtrans: Boolean(process.env.MIDTRANS_SERVER_KEY),
      whatsapp: Boolean(process.env.WA_API_KEY),
      objectStorage: Boolean(
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_STORAGE_BUCKET
      ),
    },
    warnings,
  }, null, 2));

  if (!ready) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
