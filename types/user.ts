import type { Database } from "@/lib/supabase/types";

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profiles"]["Update"];

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionLimits {
  maxProjects: number;
  maxAIQuota: number;
  canRemoveWatermark: boolean;
  maxExportResolution: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> =
  {
    free: {
      maxProjects: 5,
      maxAIQuota: 5,
      canRemoveWatermark: false,
      maxExportResolution: 2048,
    },
    pro: {
      maxProjects: Infinity,
      maxAIQuota: 100,
      canRemoveWatermark: true,
      maxExportResolution: 4096,
    },
  };
