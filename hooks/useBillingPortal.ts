import { useState } from "react";
import { toast } from "sonner";

/**
 * Hook to manage Stripe Billing Portal access
 * Allows Pro users to manage their subscriptions (cancel, update payment, view invoices)
 */
export function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false);

  const openBillingPortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể mở cổng quản lý");
      }

      const { url } = await response.json();

      // Open in new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Billing portal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể mở cổng quản lý. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openBillingPortal,
    isLoading,
  };
}
