import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TenantPortalClient } from "./_components/TenantPortalClient";
import { getTenantAccessState } from "@/lib/subscription";
import { planHasFeature } from "@/lib/plans";

export const revalidate = 3600; // 1 hour caching for performance

interface TenantPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const subdomain = resolvedParams.subdomain;
  
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { name: true, logoUrl: true }
  });

  if (!tenant) return {};

  return {
    title: tenant.name,
    icons: {
      icon: tenant.logoUrl || '/favicon.ico',
    }
  };
}

export default async function TenantB2BPortal({ params }: TenantPageProps) {
  const resolvedParams = await params;
  const subdomain = resolvedParams.subdomain;
  
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      products: {
        where: {
          type: "FINISHED_GOODS",
          isActive: true,
        },
        orderBy: [
          { stockKg: "desc" },
          { name: "asc" },
        ],
      }
    }
  });

  if (
    !tenant ||
    getTenantAccessState(tenant) !== "ACTIVE" ||
    !planHasFeature(tenant.subscriptionTier, "STOREFRONT")
  ) {
    notFound();
  }

  const {
    midtransServerKey: _midtransServerKey,
    artisanWebhookToken: _artisanWebhookToken,
    ...publicTenant
  } = tenant;

  // Next.js App Router Server -> Client serialization doesn't support Prisma Decimal
  // We need to map over products and convert decimals to numbers
  const serializedTenant = {
    ...publicTenant,
    products: tenant.products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : null,
      priceSilver: product.priceSilver ? Number(product.priceSilver) : null,
      priceGold: product.priceGold ? Number(product.priceGold) : null,
      lastHpp: product.lastHpp ? Number(product.lastHpp) : null,
      stockKg: product.stockKg ? Number(product.stockKg) : null,
      avgCostPerKg: product.avgCostPerKg ? Number(product.avgCostPerKg) : null,
    }))
  };

  // Type cast back to any or specific shape since Client component expects Decimal type structurally 
  // (Prisma types on client actually accept numbers for Decimals usually, or we can just cast to any)
  return <TenantPortalClient tenant={serializedTenant as any} />;
}
