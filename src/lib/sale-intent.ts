export type CustomerPriceTier = "RETAIL" | "WHOLESALE_SILVER" | "WHOLESALE_GOLD";

export type TieredProductPrice = {
  price: number;
  priceSilver: number;
  priceGold: number;
};

export function resolveSalePrice(product: TieredProductPrice, tier: CustomerPriceTier): number {
  const retail = Math.max(0, Number(product.price) || 0);
  const tierPrice = tier === "WHOLESALE_GOLD"
    ? Number(product.priceGold)
    : tier === "WHOLESALE_SILVER"
      ? Number(product.priceSilver)
      : retail;
  return tierPrice > 0 ? tierPrice : retail;
}

export function findDuplicateSaleProductIds(items: Array<{ productId: string }>): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item.productId)) duplicates.add(item.productId);
    seen.add(item.productId);
  }
  return [...duplicates];
}

export function defaultDueDate(from: Date, days = 14): string {
  const due = new Date(from);
  due.setDate(due.getDate() + days);
  const year = due.getFullYear();
  const month = String(due.getMonth() + 1).padStart(2, "0");
  const day = String(due.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
