"use client";

import { useState, useEffect } from "react";
import { getUserSubscriptionTier } from "@/app/actions/subscription";
import type { SubscriptionTier } from "@/types/subscription";

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const userTier = await getUserSubscriptionTier();
        setTier(userTier);
      } catch (error) {
        console.error("Failed to load subscription:", error);
        setTier("free");
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscription();
  }, []);

  return {
    tier,
    isPro: tier === "pro",
    isFree: tier === "free",
    isLoading,
  };
}
