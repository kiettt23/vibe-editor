export type SubscriptionTier = "free" | "pro";

// Database types
export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  expiresAt: Date | null;
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number | null;
  willCancelAtPeriodEnd: boolean; // User has cancelled but subscription still active
}

export const SUBSCRIPTION_CONFIG = {
  TRIAL_DAYS: 3,
  PRO_DURATION_DAYS: 30,
  FREE_PROJECT_LIMIT: 5,
} as const;

export const PRO_FEATURES = [
  "no-watermark",
  "unlimited-projects",
  "advanced-filters",
  "export-jpeg",
  "export-webp",
  "keyboard-shortcuts",
  "auto-save",
  "priority-support",
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];
