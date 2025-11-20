import Stripe from "stripe";

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Client-side publishable key
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Webhook secret for verifying events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Product configuration
export const STRIPE_CONFIG = {
  // Currency
  currency: "vnd",

  // Success/Cancel URLs (relative paths)
  successUrl: "/payment/success",
  cancelUrl: "/payment/cancelled",

  // Billing portal
  portalUrl: "/api/stripe/portal",
} as const;
