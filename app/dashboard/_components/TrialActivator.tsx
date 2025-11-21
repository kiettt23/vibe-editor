"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { activateFreeTrial } from "@/app/actions/subscription";
import { toastSuccess } from "@/lib/toast";

/**
 * Component to auto-activate trial when redirected from signup with ?trial=true
 */
export function TrialActivator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasTriggered = useRef(false);

  useEffect(() => {
    const shouldActivate = searchParams.get("trial") === "true";

    if (shouldActivate && !hasTriggered.current) {
      hasTriggered.current = true;

      // Auto-activate trial
      activateFreeTrial().then((result) => {
        if (result.success) {
          toastSuccess(
            "Chào mừng bạn!",
            "Bạn đã nhận 3 ngày dùng thử Pro miễn phí 🎉"
          );
        }

        // Remove ?trial=true from URL
        router.replace("/dashboard");
      });
    }
  }, [searchParams, router]);

  return null; // This component renders nothing
}
