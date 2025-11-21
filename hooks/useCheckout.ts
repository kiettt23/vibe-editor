"use client";

import { useState } from "react";
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

      const { url } = await response.json();

      // Redirect to Stripe Checkout (new method)
      if (!url) {
        throw new Error("No checkout URL received");
      }

      // Use direct redirect instead of deprecated redirectToCheckout
      window.location.href = url;
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
