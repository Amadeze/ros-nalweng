import { describe, expect, it } from "vitest";
import { defaultDueDate, findDuplicateSaleProductIds, resolveSalePrice } from "./sale-intent";

describe("sale intent", () => {
  const prices = { price: 100_000, priceSilver: 90_000, priceGold: 80_000 };

  it("derives the price from the customer instead of trusting manual input", () => {
    expect(resolveSalePrice(prices, "RETAIL")).toBe(100_000);
    expect(resolveSalePrice(prices, "WHOLESALE_SILVER")).toBe(90_000);
    expect(resolveSalePrice(prices, "WHOLESALE_GOLD")).toBe(80_000);
  });

  it("falls back to retail when a wholesale price is not configured", () => {
    expect(resolveSalePrice({ ...prices, priceGold: 0 }, "WHOLESALE_GOLD")).toBe(100_000);
  });

  it("identifies duplicate products before committing a sale", () => {
    expect(findDuplicateSaleProductIds([
      { productId: "coffee-a" },
      { productId: "coffee-b" },
      { productId: "coffee-a" },
    ])).toEqual(["coffee-a"]);
  });

  it("provides a realistic default due date", () => {
    expect(defaultDueDate(new Date(2026, 6, 19), 14)).toBe("2026-08-02");
  });
});
