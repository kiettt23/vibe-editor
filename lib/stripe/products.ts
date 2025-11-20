// Stripe Product & Price IDs
// These will be set after creating products in Stripe Dashboard

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!,
    name: "Pro Monthly",
    amount: 99000, // ₫99,000
    interval: "month" as const,
    description: "Pro plan billed monthly",
  },
  PRO_YEARLY: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!,
    name: "Pro Yearly",
    amount: 990000, // ₫990,000 (save 2 months)
    interval: "year" as const,
    description: "Pro plan billed yearly - Save ₫198,000!",
  },
} as const;

// Helper to get product by price ID
export function getProductByPriceId(priceId: string) {
  if (priceId === STRIPE_PRODUCTS.PRO_MONTHLY.priceId) {
    return STRIPE_PRODUCTS.PRO_MONTHLY;
  }
  if (priceId === STRIPE_PRODUCTS.PRO_YEARLY.priceId) {
    return STRIPE_PRODUCTS.PRO_YEARLY;
  }
  return null;
}

// Calculate expiry date based on interval
export function calculateExpiryDate(interval: "month" | "year"): Date {
  const now = new Date();
  if (interval === "month") {
    now.setMonth(now.getMonth() + 1);
  } else {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now;
}
