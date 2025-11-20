"use client";

import { useState } from "react";
import { getStripe } from "@/lib/stripe/client";
import { toast } from "sonner";

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckout = async (priceId: string) => {
    try {
      setIsLoading(true);

      // Call API to create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout");
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // @ts-expect-error: Stripe types issue with redirectToCheckout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tạo checkout session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckout,
    isLoading,
  };
}
