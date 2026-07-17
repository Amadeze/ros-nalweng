export type PlanTier = "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";
export type PlanFeature =
  | "CORE_OPERATIONS"
  | "STOREFRONT"
  | "REPORT_EXPORTS"
  | "ADVANCED_REPORTS"
  | "MIDTRANS"
  | "ARTISAN"
  | "CUSTOM_DOMAIN";

export const PLAN_CATALOG = {
  TRIAL: {
    label: "Trial",
    monthlyPrice: 0,
    features: [
      "CORE_OPERATIONS",
      "STOREFRONT",
      "REPORT_EXPORTS",
      "ADVANCED_REPORTS",
      "MIDTRANS",
      "ARTISAN",
    ],
  },
  BASIC: {
    label: "Basic",
    monthlyPrice: 149_000,
    features: ["CORE_OPERATIONS", "STOREFRONT", "REPORT_EXPORTS"],
  },
  PRO: {
    label: "Pro",
    monthlyPrice: 299_000,
    features: [
      "CORE_OPERATIONS",
      "STOREFRONT",
      "REPORT_EXPORTS",
      "ADVANCED_REPORTS",
      "MIDTRANS",
      "ARTISAN",
    ],
  },
  ENTERPRISE: {
    label: "Enterprise",
    monthlyPrice: null,
    features: [
      "CORE_OPERATIONS",
      "STOREFRONT",
      "REPORT_EXPORTS",
      "ADVANCED_REPORTS",
      "MIDTRANS",
      "ARTISAN",
      "CUSTOM_DOMAIN",
    ],
  },
} as const satisfies Record<
  PlanTier,
  { label: string; monthlyPrice: number | null; features: readonly PlanFeature[] }
>;

export function planHasFeature(tier: PlanTier, feature: PlanFeature) {
  return (PLAN_CATALOG[tier].features as readonly PlanFeature[]).includes(feature);
}
