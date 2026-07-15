import { PrismaClient } from "@prisma/client";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma_v3 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;

export function withTenant(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Filter models that actually have tenantId
          if (['Tenant', 'Session', 'Account', 'VerificationToken'].includes(model!)) {
            return query(args);
          }

          const mArgs = args as any;

          if (['findMany', 'findFirst', 'count', 'aggregate', 'updateMany', 'deleteMany'].includes(operation)) {
            mArgs.where = { ...mArgs.where, tenantId };
          } else if (operation === 'create') {
            mArgs.data = { ...mArgs.data, tenantId };
          } else if (operation === 'createMany') {
            if (Array.isArray(mArgs.data)) {
              mArgs.data = mArgs.data.map((d: any) => ({ ...d, tenantId }));
            } else {
              mArgs.data = { ...mArgs.data, tenantId };
            }
          } else if (['update', 'upsert', 'delete'].includes(operation)) {
            mArgs.where = { ...mArgs.where, tenantId };
          }

          return query(mArgs);
        }
      }
    }
  });
}