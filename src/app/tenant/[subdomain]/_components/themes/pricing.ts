// =============================================================================
// TIERED PRICING — B2B Wholesale Price Resolution
// =============================================================================
// Resolves display price based on customer tier.
// Product model has: price (retail), priceSilver, priceGold
// =============================================================================

export type CustomerTier = "RETAIL" | "WHOLESALE_SILVER" | "WHOLESALE_GOLD";

export interface PriceDisplay {
  /** The price to show prominently */
  price: number;
  /** Original retail price (for strikethrough when discounted) */
  retailPrice: number;
  /** Tier label for display */
  tierLabel: string;
  /** Savings percentage */
  savingsPercent: number;
  /** Tier color class */
  tierColor: string;
}

const TIER_CONFIG: Record<CustomerTier, { label: string; color: string }> = {
  RETAIL: { label: "Reguler", color: "text-[var(--t-text-muted)]" },
  WHOLESALE_SILVER: { label: "Silver", color: "text-slate-500" },
  WHOLESALE_GOLD: { label: "Gold", color: "text-amber-500" },
};

// Flexible number type that accepts Prisma Decimal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexibleNumber = number | string | { toNumber(): number } | null | undefined;

export function getDisplayPrice(
  product: { price?: FlexibleNumber; priceSilver?: FlexibleNumber; priceGold?: FlexibleNumber },
  tier: CustomerTier = "RETAIL"
): PriceDisplay {
  const retailPrice = Number(product.price || 0);
  const silverPrice = Number(product.priceSilver || retailPrice);
  const goldPrice = Number(product.priceGold || silverPrice);

  let price: number;
  let tierLabel: string;
  let tierColor: string;

  switch (tier) {
    case "WHOLESALE_GOLD":
      price = goldPrice;
      tierLabel = TIER_CONFIG.WHOLESALE_GOLD.label;
      tierColor = TIER_CONFIG.WHOLESALE_GOLD.color;
      break;
    case "WHOLESALE_SILVER":
      price = silverPrice;
      tierLabel = TIER_CONFIG.WHOLESALE_SILVER.label;
      tierColor = TIER_CONFIG.WHOLESALE_SILVER.color;
      break;
    default:
      price = retailPrice;
      tierLabel = TIER_CONFIG.RETAIL.label;
      tierColor = TIER_CONFIG.RETAIL.color;
  }

  const savingsPercent = retailPrice > 0 ? Math.round(((retailPrice - price) / retailPrice) * 100) : 0;

  return { price, retailPrice, tierLabel, savingsPercent, tierColor };
}

export function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** Get the MOQ (Minimum Order Quantity) for a product */
export function getMoq(product: { stockKg?: number | string | { toNumber(): number } | null; type?: string }): number {
  // Wholesale default: 1 Kg minimum for roasted beans
  return 1;
}
