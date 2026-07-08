"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// =============================================================================
// TYPES
// =============================================================================

export type SupplierRow = {
  id: string; code: string; name: string; phone: string | null;
  address: string | null; region: string | null; isActive: boolean;
  createdAt: string; purchaseCount: number;
};

export type CustomerRow = {
  id: string; code: string; name: string; phone: string | null;
  email: string | null; address: string | null; isActive: boolean;
  tier: "RETAIL" | "WHOLESALE_SILVER" | "WHOLESALE_GOLD";
  createdAt: string; invoiceCount: number;
};

export type PackagingRow = {
  id: string; code: string; name: string;
  weightGrams: number; costPerUnit: number; isActive: boolean;
};

export type UserRow = {
  id: string; name: string; email: string;
  role: "OWNER" | "MANAGER" | "OPERATOR" | "CASHIER";
  isActive: boolean; createdAt: string;
};

export type ProductRecipeItem = {
  id: string; rbProductId: string; gramsPerUnit: number; ratioPercent: number;
};

export type ProductRecipe = {
  id: string; packagingId: string; outputGrams: number; notes: string | null;
  items: ProductRecipeItem[];
};

export type ProductRow = {
  id: string; code: string; name: string;
  type: "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  origin: string | null; roastLevel: string | null; description: string | null;
  isActive: boolean; createdAt: string;
  price: number;
  priceSilver: number;
  priceGold: number;
  recipe: ProductRecipe | null;
};

export type MasterPageData = {
  suppliers:  SupplierRow[];
  customers:  CustomerRow[];
  products:   ProductRow[];
  packagings: PackagingRow[];
  users:      UserRow[];
};

// =============================================================================
// PAGE DATA
// =============================================================================

export async function getMasterData(): Promise<MasterPageData> {
  const [suppliers, customers, products, packagings, users] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { purchases: true } } },
    }),

    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { invoices: true } } },
    }),

    // ✅ QUERY PRODUCT YANG SUDAH DIPERBAIKI
 prisma.product.findMany({
  orderBy: [{ type: "asc" }, { name: "asc" }],
  select: {
    id: true,
    code: true,
    name: true,
    type: true,
    origin: true,
    roastLevel: true,
    description: true,
    isActive: true,
    createdAt: true,
    price: true,
    priceSilver: true,
    priceGold: true,
    recipes: {
      where: { isActive: true },
      select: {
        id: true,
        packagingId: true,
        outputGrams: true,
        notes: true,
        items: {
          select: {
            id: true,
            productId: true,
            gramsPerUnit: true,
            ratioPercent: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    },
  },
}),

    prisma.packaging.findMany({
      orderBy: { name: "asc" },
    }),

    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isActive: true, 
        createdAt: true 
      },
    }),
  ]);

  return {
    suppliers: suppliers.map((s) => ({
      id: s.id, code: s.code, name: s.name, phone: s.phone,
      address: s.address, region: s.region, isActive: s.isActive,
      createdAt: s.createdAt.toISOString(), purchaseCount: s._count.purchases,
    })),

    customers: customers.map((c) => ({
      id: c.id, code: c.code, name: c.name, phone: c.phone,
      email: c.email, address: c.address, isActive: c.isActive,
      tier: c.tier as CustomerRow["tier"],
      createdAt: c.createdAt.toISOString(),
      invoiceCount: c._count.invoices,
    })),

    products: products.map((p) => {
      const r = p.recipes[0] ?? null;
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        type: p.type as ProductRow["type"],
        origin: p.origin,
        roastLevel: p.roastLevel,
        description: p.description,
        isActive: p.isActive,
        price: p.price ? Number(p.price) : 0,
        priceSilver: p.priceSilver ? Number(p.priceSilver) : 0,
        priceGold: p.priceGold ? Number(p.priceGold) : 0,
        createdAt: p.createdAt.toISOString(),
        recipe: r
          ? {
              id: r.id,
              packagingId: r.packagingId,
              outputGrams: Number(r.outputGrams),
              notes: r.notes,
              items: r.items.map((i) => ({
                id: i.id,
                rbProductId: i.productId,
                gramsPerUnit: Number(i.gramsPerUnit),
                ratioPercent: Number(i.ratioPercent),
              })),
            }
          : null,
      };
    }),

    packagings: packagings.map((pkg) => ({
      id: pkg.id, 
      code: pkg.code, 
      name: pkg.name,
      weightGrams: Number(pkg.weightGrams),
      costPerUnit: Number(pkg.costPerUnit),
      isActive: pkg.isActive,
    })),

    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRow["role"],
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    })),
  };
}

// ... (bagian bawah file tetap sama, tidak ada perubahan)

// =============================================================================
// SHARED
// =============================================================================

export type ActionResult =
  | { success: true; code: string }
  | { success: false; error: string };

// =============================================================================
// SUPPLIER — CREATE
// =============================================================================

export type CreateSupplierInput = {
  name: string; phone?: string; address?: string; region?: string;
};

export async function createSupplier(input: CreateSupplierInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama supplier wajib diisi." };
    const count = await prisma.supplier.count();
    const code  = `SUP-${String(count + 1).padStart(3, "0")}`;
    await prisma.supplier.create({
      data: { code, name: input.name.trim(), phone: input.phone?.trim() || null,
              address: input.address?.trim() || null, region: input.region?.trim() || null },
    });
    revalidatePath("/master-data"); revalidatePath("/inventory");
    return { success: true, code };
  } catch (err) {
    console.error("[createSupplier]", err);
    return { success: false, error: "Gagal menyimpan supplier. Coba lagi." };
  }
}

// SUPPLIER — UPDATE

export type UpdateSupplierInput = CreateSupplierInput & { id: string; isActive: boolean };

export async function updateSupplier(input: UpdateSupplierInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama supplier wajib diisi." };
    const existing = await prisma.supplier.findUnique({ where: { id: input.id }, select: { code: true } });
    if (!existing) return { success: false, error: "Supplier tidak ditemukan." };
    await prisma.supplier.update({
      where: { id: input.id },
      data: { name: input.name.trim(), phone: input.phone?.trim() || null,
              address: input.address?.trim() || null, region: input.region?.trim() || null,
              isActive: input.isActive },
    });
    revalidatePath("/master-data"); revalidatePath("/inventory");
    return { success: true, code: existing.code };
  } catch (err) {
    console.error("[updateSupplier]", err);
    return { success: false, error: "Gagal memperbarui supplier. Coba lagi." };
  }
}

// =============================================================================
// CUSTOMER — CREATE
// =============================================================================

export type CreateCustomerInput = {
  name: string; phone?: string; email?: string; address?: string;
  tier?: "RETAIL" | "WHOLESALE_SILVER" | "WHOLESALE_GOLD";
};

export async function createCustomer(input: CreateCustomerInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama pelanggan wajib diisi." };
    const count = await prisma.customer.count();
    const code  = `CST-${String(count + 1).padStart(3, "0")}`;
    await prisma.customer.create({
      data: { code, name: input.name.trim(), phone: input.phone?.trim() || null,
              email: input.email?.trim() || null, address: input.address?.trim() || null,
              tier: input.tier || "RETAIL" },
    });
    revalidatePath("/master-data"); revalidatePath("/penjualan");
    return { success: true, code };
  } catch (err) {
    console.error("[createCustomer]", err);
    return { success: false, error: "Gagal menyimpan pelanggan. Coba lagi." };
  }
}

// CUSTOMER — UPDATE

export type UpdateCustomerInput = CreateCustomerInput & { id: string; isActive: boolean };

export async function updateCustomer(input: UpdateCustomerInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama pelanggan wajib diisi." };
    const existing = await prisma.customer.findUnique({ where: { id: input.id }, select: { code: true } });
    if (!existing) return { success: false, error: "Pelanggan tidak ditemukan." };
    await prisma.customer.update({
      where: { id: input.id },
      data: { name: input.name.trim(), phone: input.phone?.trim() || null,
              email: input.email?.trim() || null, address: input.address?.trim() || null,
              tier: input.tier || "RETAIL",
              isActive: input.isActive },
    });
    revalidatePath("/master-data"); revalidatePath("/penjualan");
    return { success: true, code: existing.code };
  } catch (err) {
    console.error("[updateCustomer]", err);
    return { success: false, error: "Gagal memperbarui pelanggan. Coba lagi." };
  }
}

// =============================================================================
// USER
// =============================================================================

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRow["role"];
};

export type UpdateUserInput = {
  id: string;
  name: string;
  email: string;
  role: UserRow["role"];
  isActive: boolean;
  password?: string;
};

const USER_ROLES: UserRow["role"][] = ["OWNER", "MANAGER", "OPERATOR", "CASHIER"];

export async function createUser(input: CreateUserInput): Promise<ActionResult> {
  try {
    const name = input.name?.trim();
    const email = input.email?.toLowerCase().trim();
    const password = input.password?.trim();

    if (!name) return { success: false, error: "Nama pengguna wajib diisi." };
    if (!email) return { success: false, error: "Email wajib diisi." };
    if (!password) return { success: false, error: "Password wajib diisi." };
    if (!USER_ROLES.includes(input.role)) return { success: false, error: "Role pengguna tidak valid." };

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return { success: false, error: "Email sudah digunakan pengguna lain." };

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: input.role },
    });

    revalidatePath("/master-data");
    return { success: true, code: email };
  } catch (err) {
    console.error("[createUser]", err);
    return { success: false, error: "Gagal menyimpan pengguna. Coba lagi." };
  }
}

export async function updateUser(input: UpdateUserInput): Promise<ActionResult> {
  try {
    const name = input.name?.trim();
    const email = input.email?.toLowerCase().trim();
    const password = input.password?.trim();

    if (!name) return { success: false, error: "Nama pengguna wajib diisi." };
    if (!email) return { success: false, error: "Email wajib diisi." };
    if (!USER_ROLES.includes(input.role)) return { success: false, error: "Role pengguna tidak valid." };

    const existing = await prisma.user.findUnique({ where: { id: input.id }, select: { id: true } });
    if (!existing) return { success: false, error: "Pengguna tidak ditemukan." };

    const duplicate = await prisma.user.findFirst({
      where: { email, NOT: { id: input.id } },
      select: { id: true },
    });
    if (duplicate) return { success: false, error: "Email sudah digunakan pengguna lain." };

    const data: {
      name: string;
      email: string;
      role: UserRow["role"];
      isActive: boolean;
      password?: string;
    } = {
      name,
      email,
      role: input.role,
      isActive: input.isActive,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: input.id },
      data,
    });

    revalidatePath("/master-data");
    return { success: true, code: email };
  } catch (err) {
    console.error("[updateUser]", err);
    return { success: false, error: "Gagal memperbarui pengguna. Coba lagi." };
  }
}

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export type RecipeItemInput = {
  rbProductId:  string;
  gramsPerUnit: number;
};

export type RecipeInput = {
  packagingId:  string;
  outputGrams:  number;
  notes?:       string;
  items:        RecipeItemInput[];
};

export type CreateProductInput = {
  name: string;
  type: "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  origin?:      string;
  roastLevel?:  "LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | null;
  description?: string;
  price?:       number; // Harga jual retail
  priceSilver?: number; // Harga jual Wholesale Silver
  priceGold?:   number; // Harga jual Wholesale Gold
  recipe?:      RecipeInput;
};

export type UpdateProductInput = Omit<CreateProductInput, "type"> & {
  id:       string;
  isActive: boolean;
  recipe?:  RecipeInput;
};

const TYPE_PREFIX: Record<CreateProductInput["type"], string> = {
  GREEN_BEAN:     "GB",
  ROASTED_BEAN:   "RB",
  FINISHED_GOODS: "FG",
  PACKAGING:      "PK",
};

// =============================================================================
// PRODUCT — CREATE
// =============================================================================

export async function createProduct(input: CreateProductInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama produk wajib diisi." };

    const prefix = TYPE_PREFIX[input.type];
    const count  = await prisma.product.count({ where: { type: input.type } });
    const code   = `${prefix}-${String(count + 1).padStart(3, "0")}`;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          code, name: input.name.trim(), type: input.type,
          origin:      input.origin?.trim()      || null,
          roastLevel:  input.type === "ROASTED_BEAN" ? (input.roastLevel ?? null) : null,
          description: input.description?.trim() || null,
          price:       input.type === "FINISHED_GOODS" ? (input.price ?? 0) : null,
          priceSilver: input.type === "FINISHED_GOODS" ? (input.priceSilver ?? 0) : null,
          priceGold:   input.type === "FINISHED_GOODS" ? (input.priceGold ?? 0) : null,
        },
      });

      if (input.type === "FINISHED_GOODS" && input.recipe && input.recipe.items.length > 0) {
        const r = input.recipe;
        const rCount  = await tx.recipe.count();
        const rCode   = `RCP-${String(rCount + 1).padStart(3, "0")}`;
        const outputG = r.outputGrams;

        await tx.recipe.create({
          data: {
            code:        rCode,
            name:        input.name.trim(),
            productId:   product.id,
            packagingId: r.packagingId,
            outputGrams: outputG,
            notes:       r.notes?.trim() || null,
            items: {
              create: r.items.map((item) => ({
                productId:    item.rbProductId,
                gramsPerUnit: item.gramsPerUnit,
                ratioPercent: outputG > 0 ? (item.gramsPerUnit / outputG) * 100 : 0,
              })),
            },
          },
        });
      }
    });

    revalidatePath("/master-data"); revalidatePath("/inventory");
    revalidatePath("/roasting");    revalidatePath("/produksi");
    return { success: true, code };
  } catch (err) {
    console.error("[createProduct]", err);
    return { success: false, error: "Gagal menyimpan produk. Coba lagi." };
  }
}

// =============================================================================
// PRODUCT — UPDATE
// =============================================================================

export async function updateProduct(input: UpdateProductInput): Promise<ActionResult> {
  try {
    if (!input.name?.trim()) return { success: false, error: "Nama produk wajib diisi." };

    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { code: true, type: true, recipes: { where: { isActive: true }, select: { id: true }, take: 1 } },
    });
    if (!existing) return { success: false, error: "Produk tidak ditemukan." };

    await prisma.$transaction(async (tx) => {
      // ✅ DITAMBAHKAN: Data price dikirim untuk update
      await tx.product.update({
        where: { id: input.id },
        data: {
          name:        input.name!.trim(),
          origin:      input.origin?.trim()      || null,
          roastLevel:  existing.type === "ROASTED_BEAN" ? (input.roastLevel ?? null) : null,
          description: input.description?.trim() || null,
          isActive:    input.isActive,
          price:       existing.type === "FINISHED_GOODS" && input.price !== undefined ? input.price : undefined,
          priceSilver: existing.type === "FINISHED_GOODS" && input.priceSilver !== undefined ? input.priceSilver : undefined,
          priceGold:   existing.type === "FINISHED_GOODS" && input.priceGold !== undefined ? input.priceGold : undefined,
        },
      });

      if (existing.type === "FINISHED_GOODS" && input.recipe && input.recipe.items.length > 0) {
        const r       = input.recipe;
        const outputG = r.outputGrams;
        const existingRecipe = existing.recipes[0];

        if (existingRecipe) {
          // Update existing recipe: delete old items, insert new ones
          await tx.recipeItem.deleteMany({ where: { recipeId: existingRecipe.id } });
          await tx.recipe.update({
            where: { id: existingRecipe.id },
            data: {
              packagingId: r.packagingId,
              outputGrams: outputG,
              notes:       r.notes?.trim() || null,
              items: {
                create: r.items.map((item) => ({
                  productId:    item.rbProductId,
                  gramsPerUnit: item.gramsPerUnit,
                  ratioPercent: outputG > 0 ? (item.gramsPerUnit / outputG) * 100 : 0,
                })),
              },
            },
          });
        } else {
          // Create brand-new recipe for this product
          const rCount = await tx.recipe.count();
          const rCode  = `RCP-${String(rCount + 1).padStart(3, "0")}`;
          await tx.recipe.create({
            data: {
              code:        rCode,
              name:        input.name!.trim(),
              productId:   input.id,
              packagingId: r.packagingId,
              outputGrams: outputG,
              notes:       r.notes?.trim() || null,
              items: {
                create: r.items.map((item) => ({
                  productId:    item.rbProductId,
                  gramsPerUnit: item.gramsPerUnit,
                  ratioPercent: outputG > 0 ? (item.gramsPerUnit / outputG) * 100 : 0,
                })),
              },
            },
          });
        }
      }
    });

    revalidatePath("/master-data"); revalidatePath("/inventory");
    revalidatePath("/roasting");    revalidatePath("/produksi");
    return { success: true, code: existing.code };
  } catch (err) {
    console.error("[updateProduct]", err);
    return { success: false, error: "Gagal memperbarui produk. Coba lagi." };
  }
}
