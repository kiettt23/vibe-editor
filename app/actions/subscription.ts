"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SUBSCRIPTION_CONFIG } from "@/types/subscription";
import type { SubscriptionTier, UserSubscription } from "@/types/subscription";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

/**
 * Get current user subscription tier (for client components)
 * This is a lightweight version that only returns the tier
 * Use this in useSubscription hook instead of getUserSubscription from get-subscription.ts
 */
export async function getUserSubscriptionTier(): Promise<SubscriptionTier> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return "free";
    }

    const { data, error } = (await supabase
      .from("user_subscriptions")
      .select("subscription_tier, subscription_expires_at")
      .eq("user_id", user.id)
      .single()) as {
      data: {
        subscription_tier: string;
        subscription_expires_at: string | null;
      } | null;
      error: unknown;
    };

    if (error || !data) {
      return "free";
    }

    const tier = data.subscription_tier as SubscriptionTier;
    const expiresAt = data.subscription_expires_at;

    // Check if expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return "free";
    }

    return tier;
  } catch (error) {
    console.error("Error in getUserSubscriptionTier:", error);
    return "free"; // Fail gracefully
  }
}

/**
 * Upgrade user to Pro plan
 * Called after successful Stripe payment
 */
export async function upgradeToProPlan(
  userId: string,
  durationDays = SUBSCRIPTION_CONFIG.PRO_DURATION_DAYS
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const { error } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription_tier: "pro",
        subscription_expires_at: expiryDate.toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Upgrade error:", error);
      return {
        success: false,
        error: "Không thể nâng cấp tài khoản",
        code: "UPGRADE_FAILED",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/editor");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in upgradeToProPlan:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Downgrade user to Free plan
 * Called when subscription expires or user cancels
 */
export async function downgradeToFree(
  userId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription_tier: "free",
        subscription_expires_at: null,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Downgrade error:", error);
      return {
        success: false,
        error: "Không thể hạ cấp tài khoản",
        code: "DOWNGRADE_FAILED",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/editor");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in downgradeToFree:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Assign trial to new user
 * Called during signup
 */
export async function assignTrialToNewUser(
  userId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SUBSCRIPTION_CONFIG.TRIAL_DAYS);

    const { error } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription_tier: "pro",
        subscription_expires_at: expiryDate.toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Trial assignment error:", error);
      return {
        success: false,
        error: "Không thể kích hoạt trial",
        code: "TRIAL_FAILED",
      };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in assignTrialToNewUser:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Activate free 3-day Pro trial for user
 * Called when user clicks "Dùng thử 3 ngày" on pricing page
 * Can only be used once per user
 */
export async function activateFreeTrial(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập trước",
        code: "UNAUTHORIZED",
      };
    }

    // Check if user already has or had Pro subscription
    const { data: existingSub } = (await supabase
      .from("user_subscriptions")
      .select("subscription_tier, stripe_customer_id")
      .eq("user_id", user.id)
      .single()) as {
      data: {
        subscription_tier: string;
        stripe_customer_id: string | null;
      } | null;
      error: unknown;
    };

    if (!existingSub) {
      return {
        success: false,
        error: "Không tìm thấy thông tin tài khoản",
        code: "NOT_FOUND",
      };
    }

    // Check if user already has Pro (paid or trial)
    if (existingSub.subscription_tier === "pro") {
      return {
        success: false,
        error: "Bạn đã có gói Pro rồi",
        code: "ALREADY_PRO",
      };
    }

    // Check if user already used trial (has stripe_customer_id = trial used before)
    // Note: We can add a separate "trial_used" boolean field later if needed
    if (existingSub.stripe_customer_id !== null) {
      return {
        success: false,
        error: "Bạn đã sử dụng gói dùng thử rồi",
        code: "TRIAL_USED",
      };
    }

    // Upgrade to Pro trial for 3 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    const { error: updateError } = await supabase
      .from("user_subscriptions")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription_tier: "pro",
        subscription_expires_at: expiryDate.toISOString(),
        ai_quota_limit: 100, // Pro quota
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to activate trial:", updateError);
      return {
        success: false,
        error: "Không thể kích hoạt gói dùng thử",
        code: "ACTIVATION_FAILED",
      };
    }

    // Also sync user_profiles (legacy field)
    await supabase
      .from("user_profiles")
      // @ts-expect-error: Supabase types not fully generated yet
      .update({
        subscription: "pro",
        ai_quota_limit: 100,
      })
      .eq("user_id", user.id);

    revalidatePath("/dashboard");
    revalidatePath("/pricing");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in activateFreeTrial:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra",
      code: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Get current user subscription (client-safe)
 */
export async function getCurrentUserSubscription(): Promise<
  ActionResult<{
    tier: SubscriptionTier;
    expiresAt: string | null;
    isTrial: boolean;
    daysRemaining: number | null;
  }>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Chưa đăng nhập",
        code: "UNAUTHORIZED",
      };
    }

    const { data, error } = (await supabase
      .from("user_subscriptions")
      .select("subscription_tier, subscription_expires_at, created_at")
      .eq("user_id", user.id)
      .single()) as {
      data: Pick<
        UserSubscription,
        "subscription_tier" | "subscription_expires_at" | "created_at"
      > | null;
      error: unknown;
    };

    if (error || !data) {
      return {
        success: false,
        error: "Không thể lấy thông tin subscription",
        code: "FETCH_FAILED",
      };
    }

    const tier = data.subscription_tier as SubscriptionTier;
    const expiresAt = data.subscription_expires_at;
    const createdAt = new Date(data.created_at);
    const now = new Date();

    // Check if trial
    const accountAge = now.getTime() - createdAt.getTime();
    const trialPeriod = SUBSCRIPTION_CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const isTrial = tier === "pro" && accountAge < trialPeriod;

    // Calculate days remaining
    const daysRemaining = expiresAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(expiresAt).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

    return {
      success: true,
      data: {
        tier,
        expiresAt,
        isTrial,
        daysRemaining,
      },
    };
  } catch (error) {
    console.error("Unexpected error in getCurrentUserSubscription:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra",
      code: "INTERNAL_ERROR",
    };
  }
}
