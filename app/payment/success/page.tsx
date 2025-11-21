import { Suspense } from "react";
import PaymentSuccessContent from "./PaymentSuccessContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán thành công | VibeEditor",
  description: "Thanh toán đã được xử lý thành công",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
