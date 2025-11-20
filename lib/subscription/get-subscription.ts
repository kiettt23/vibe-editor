import { createClient } from "@/lib/supabase/server";
import type {
  SubscriptionStatus,
  SubscriptionTier,
  UserSubscription,
} from "@/types/subscription";
import { SUBSCRIPTION_CONFIG } from "@/types/subscription";

/**
 * Get user subscription status with expiry check
 * Returns 'free' if expired, even if DB says 'pro'
 */
export async function getUserSubscription(): Promise<SubscriptionTier> {
  // Mock mode for development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_MOCK_SUBSCRIPTION
  ) {
    return process.env.NEXT_PUBLIC_MOCK_SUBSCRIPTION as SubscriptionTier;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "free";

  const { data, error } = (await supabase
    .from("user_subscriptions")
    .select("subscription_tier, subscription_expires_at")
    .eq("user_id", user.id)
    .single()) as {
    data: Pick<
      UserSubscription,
      "subscription_tier" | "subscription_expires_at"
    > | null;
    error: unknown;
  };

  if (error || !data) return "free";

  // Check expiry
  if (data.subscription_tier === "pro" && data.subscription_expires_at) {
    const expiryDate = new Date(data.subscription_expires_at);
    const now = new Date();

    if (expiryDate < now) {
      // Expired - auto downgrade
      await supabase
        .from("user_subscriptions")
        // @ts-expect-error: Supabase types not fully generated yet
        .update({ subscription_tier: "free" })
        .eq("user_id", user.id);

      return "free";
    }
  }

  return (data.subscription_tier as SubscriptionTier) || "free";
}

/**
 * Get detailed subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      tier: "free",
      expiresAt: null,
      isActive: false,
      isTrial: false,
      daysRemaining: null,
    };
  }

  const { data } = (await supabase
    .from("user_subscriptions")
    .select("subscription_tier, subscription_expires_at, created_at")
    .eq("user_id", user.id)
    .single()) as {
    data: Pick<
      UserSubscription,
      "subscription_tier" | "subscription_expires_at" | "created_at"
    > | null;
  };

  if (!data) {
    return {
      tier: "free",
      expiresAt: null,
      isActive: false,
      isTrial: false,
      daysRemaining: null,
    };
  }

  const tier = data.subscription_tier as SubscriptionTier;
  const expiresAt = data.subscription_expires_at
    ? new Date(data.subscription_expires_at)
    : null;
  const createdAt = new Date(data.created_at);
  const now = new Date();

  // Check if expired
  const isActive = tier === "pro" && (!expiresAt || expiresAt > now);

  // Check if trial (created within 3 days and pro)
  const accountAge = now.getTime() - createdAt.getTime();
  const trialPeriod = SUBSCRIPTION_CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const isTrial = isActive && accountAge < trialPeriod;

  // Calculate days remaining
  const daysRemaining = expiresAt
    ? Math.max(
        0,
        Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return {
    tier: isActive ? tier : "free",
    expiresAt,
    isActive,
    isTrial,
    daysRemaining,
  };
}

/**
 * Check if user is Pro
 */
export async function isProUser(): Promise<boolean> {
  const tier = await getUserSubscription();
  return tier === "pro";
}

/**
 * Check if user can create more projects
 */
export async function canCreateProject(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const tier = await getUserSubscription();

  // Pro users unlimited
  if (tier === "pro") return true;

  // Free users check limit
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (count || 0) < SUBSCRIPTION_CONFIG.FREE_PROJECT_LIMIT;
}
