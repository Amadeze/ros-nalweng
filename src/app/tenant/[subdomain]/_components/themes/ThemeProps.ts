import { Tenant, Product } from "@prisma/client";

export type ExtendedTenant = Tenant & {
  // We can just rely on the Tenant type from @prisma/client, which already includes the new fields now!
};

export interface ThemeProps {
  tenant: ExtendedTenant & { products: Product[] };
  products?: any[];
  cart: any; // We'll pass the cart store from the main client component
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerAddress: string;
  setCustomerAddress: (val: string) => void;
  shippingMethod: string;
  setShippingMethod: (val: string) => void;
  handleAddToCart: (product: any) => void;
  handleCheckout: () => void;
  isCheckingOut?: boolean;
  mounted: boolean;
  // Common computed properties
  heroGreeting: string;
  aboutText: string;
  catalogTitle: string;
  catalogSubtitle: string;
  footerText: string;
  waLink: string;
  emailLink: string | null;
  igLink: string | null;
  iconStroke?: number;
  iconProps: { weight: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" };
  isDark: boolean;
}
