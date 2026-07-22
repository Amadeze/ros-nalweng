import { AsyncLocalStorage } from "node:async_hooks";
import { Prisma, PrismaClient } from "@prisma/client";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Stores the active tenant-scoped client so assertion queries inside
// $transaction use the same connection and can see uncommitted writes.
const assertionClientStore = new AsyncLocalStorage<any>();

function getAssertionClient() {
  return assertionClientStore.getStore() ?? prisma;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  const pool = new Pool({
    connectionString,
    max: 10, // Allow sufficient connections for concurrent queries
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma_v3 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;

const tenantScopedModels = new Set(
  Prisma.dmmf.datamodel.models
    .filter((model) => model.fields.some((field) => field.name === "tenantId"))
    .map((model) => model.name),
);

type OwnedRelation = {
  foreignKey: string;
  relation: string;
  delegate: string;
};

const ownedRelations: Record<string, OwnedRelation[]> = {
  Recipe: [
    { foreignKey: "packagingId", relation: "packaging", delegate: "packaging" },
  ],
  RecipeItem: [
    { foreignKey: "productId", relation: "product", delegate: "product" },
  ],
  Purchase: [
    { foreignKey: "supplierId", relation: "supplier", delegate: "supplier" },
    { foreignKey: "productId", relation: "product", delegate: "product" },
    { foreignKey: "packagingId", relation: "packaging", delegate: "packaging" },
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  ParentRoastingBatch: [
    { foreignKey: "inputProductId", relation: "inputProduct", delegate: "product" },
    { foreignKey: "outputProductId", relation: "outputProduct", delegate: "product" },
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  ProductionBatch: [
    { foreignKey: "recipeId", relation: "recipe", delegate: "recipe" },
    { foreignKey: "outputProductId", relation: "outputProduct", delegate: "product" },
    { foreignKey: "packagingId", relation: "packaging", delegate: "packaging" },
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  Invoice: [
    { foreignKey: "customerId", relation: "customer", delegate: "customer" },
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  InvoiceItem: [
    { foreignKey: "productId", relation: "product", delegate: "product" },
  ],
  Payment: [
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  SupplierPayment: [
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  InventoryLedger: [
    { foreignKey: "productId", relation: "product", delegate: "product" },
    { foreignKey: "packagingId", relation: "packaging", delegate: "packaging" },
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  Expense: [
    { foreignKey: "createdById", relation: "createdBy", delegate: "user" },
  ],
  AuditLog: [
    { foreignKey: "userId", relation: "user", delegate: "user" },
  ],
  ReminderDelivery: [
    { foreignKey: "invoiceId", relation: "invoice", delegate: "invoice" },
  ],
};

const nestedOwnedRelations: Record<
  string,
  Array<{ path: string; relation: OwnedRelation }>
> = {
  Invoice: [
    {
      path: "items.create",
      relation: { foreignKey: "productId", relation: "product", delegate: "product" },
    },
  ],
  Recipe: [
    {
      path: "items.create",
      relation: { foreignKey: "productId", relation: "product", delegate: "product" },
    },
  ],
};

function getRelatedParentId(data: Record<string, any>, relation: string, foreignKey: string) {
  return data[foreignKey] ?? data[relation]?.connect?.id;
}

function getPath(value: Record<string, any>, path: string) {
  return path.split(".").reduce<any>((current, key) => current?.[key], value);
}

async function assertOwnedRelationsBelongToTenant(
  model: string,
  data: Record<string, any> | Record<string, any>[],
  tenantId: string,
) {
  const client = getAssertionClient();
  const rows = Array.isArray(data) ? data : [data];
  const relations = ownedRelations[model] ?? [];

  for (const relation of relations) {
    const ids = [
      ...new Set(
        rows
          .map((row) =>
            getRelatedParentId(row, relation.relation, relation.foreignKey),
          )
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    ];
    if (ids.length === 0) continue;

    const matching = await (client as any)[relation.delegate].count({
      where: { id: { in: ids }, tenantId },
    });
    if (matching !== ids.length) {
      throw new Error(`Cross-tenant ${model}.${relation.foreignKey} write rejected.`);
    }
  }

  for (const nested of nestedOwnedRelations[model] ?? []) {
    const nestedRows = rows.flatMap((row) => {
      const value = getPath(row, nested.path);
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    });
    if (nestedRows.length === 0) continue;

    const ids = [
      ...new Set(
        nestedRows
          .map((row) =>
            getRelatedParentId(
              row,
              nested.relation.relation,
              nested.relation.foreignKey,
            ),
          )
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    ];
    if (ids.length === 0) continue;

    const matching = await (client as any)[nested.relation.delegate].count({
      where: { id: { in: ids }, tenantId },
    });
    if (matching !== ids.length) {
      throw new Error(`Cross-tenant nested ${model} write rejected.`);
    }
  }
}

export function withTenant(tenantId: string) {
  const client = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const mArgs = args as any;
          const isDirectTenantModel = tenantScopedModels.has(model);

          if (!isDirectTenantModel) {
            return query(args);
          }

          const filteredOperations = [
            "findMany",
            "findFirst",
            "findFirstOrThrow",
            "findUnique",
            "findUniqueOrThrow",
            "count",
            "aggregate",
            "groupBy",
            "updateMany",
            "deleteMany",
            "update",
            "delete",
            "upsert",
          ];

          if (filteredOperations.includes(operation)) {
            mArgs.where = { ...mArgs.where, tenantId };
          }

          if (operation === "create") {
            mArgs.data = { ...mArgs.data, tenantId };
          } else if (operation === "createMany") {
            if (Array.isArray(mArgs.data)) {
              mArgs.data = mArgs.data.map((d: any) => ({ ...d, tenantId }));
            } else {
              mArgs.data = { ...mArgs.data, tenantId };
            }
          } else if (operation === "update") {
            mArgs.data = { ...mArgs.data, tenantId };
          } else if (operation === "upsert") {
            mArgs.create = { ...mArgs.create, tenantId };
            mArgs.update = { ...mArgs.update, tenantId };
          }

          if (operation === "create" || operation === "createMany") {
            await assertOwnedRelationsBelongToTenant(model, mArgs.data, tenantId);
          } else if (operation === "update") {
            await assertOwnedRelationsBelongToTenant(model, mArgs.data, tenantId);
          } else if (operation === "upsert") {
            await assertOwnedRelationsBelongToTenant(model, mArgs.create, tenantId);
            await assertOwnedRelationsBelongToTenant(model, mArgs.update, tenantId);
          }

          return query(mArgs);
        },
      },
    },
  });

  // Wrap $transaction to set the AsyncLocalStorage context so that
  // assertion queries inside the transaction use the same connection
  // and can see uncommitted writes (e.g. a product created in the same tx).
  const origTx = (client as any).$transaction.bind(client);
  (client as any).$transaction = async function (
    fnOrOps: any,
    options?: any,
  ) {
    if (typeof fnOrOps === "function") {
      return assertionClientStore.run(client, async () => {
        return origTx(async (tx: any) => {
          return assertionClientStore.run(tx, () => fnOrOps(tx));
        }, options);
      });
    }
    return origTx(fnOrOps, options);
  };

  return client;
}
