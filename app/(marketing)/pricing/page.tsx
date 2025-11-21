"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ProBadge } from "@/components/shared/pro-badge";
import { useCheckout } from "@/hooks/useCheckout";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";
import { cn } from "@/lib/utils";
import { activateFreeTrial } from "@/app/actions/subscription";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/lib/toast";

type BillingInterval = "monthly" | "yearly";

const trialFeatures = [
  "✨ 3 ngày dùng thử MIỄN PHÍ",
  "Dự án không giới hạn",
  "TẤT CẢ filters nâng cao",
  "TẤT CẢ 10 preset filters",
  "Không có watermark",
  "Export tất cả định dạng",
  "Tất cả tính năng Pro đầy đủ",
];

const proFeatures = [
  "Dự án không giới hạn",
  "TẤT CẢ filters nâng cao (Saturation, Hue)",
  "TẤT CẢ 10 preset filters cao cấp",
  "Không có watermark khi export",
  "Export tất cả định dạng (PNG, JPEG, WebP)",
  "Auto-save mọi thao tác",
  "Keyboard shortcuts (Ctrl+S, Ctrl+E, Ctrl+R)",
  "Hỗ trợ ưu tiên",
  "Truy cập sớm tính năng mới",
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly");
  const { createCheckout, isLoading } = useCheckout();
  const router = useRouter();
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    await createCheckout(priceId);
  };

  const handleActivateTrial = async () => {
    setIsActivatingTrial(true);
    try {
      const result = await activateFreeTrial();

      if (result.success) {
        toastSuccess(
          "Thành công!",
          "Bạn đã kích hoạt gói dùng thử 3 ngày Pro miễn phí"
        );
        router.push("/dashboard");
      } else {
        // Handle different error cases
        if (result.code === "UNAUTHORIZED") {
          // User not logged in - redirect to signup
          router.push("/signup?trial=true");
        } else if (result.code === "ALREADY_PRO") {
          toastError("Bạn đã có gói Pro rồi", "Không cần kích hoạt trial nữa");
        } else if (result.code === "TRIAL_USED") {
          toastError(
            "Đã sử dụng gói dùng thử",
            "Bạn đã dùng gói trial rồi. Vui lòng nâng cấp Pro để tiếp tục."
          );
        } else {
          toastError("Có lỗi xảy ra", result.error);
        }
      }
    } catch (error) {
      console.error("Failed to activate trial:", error);
      toastError("Có lỗi xảy ra", "Vui lòng thử lại sau");
    } finally {
      setIsActivatingTrial(false);
    }
  };

  // Calculate prices
  const monthlyPrice = STRIPE_PRODUCTS.PRO_MONTHLY.amount;
  const yearlyPrice = STRIPE_PRODUCTS.PRO_YEARLY.amount;
  const yearlyMonthly = Math.round(yearlyPrice / 12);
  const yearlySavings = monthlyPrice * 12 - yearlyPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 pt-28 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Chọn gói phù hợp với bạn
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
          Bắt đầu miễn phí với trial 3 ngày, nâng cấp Pro để mở khóa tất cả tính
          năng
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Hàng tháng
          </span>
          <button
            onClick={() =>
              setBillingInterval(
                billingInterval === "monthly" ? "yearly" : "monthly"
              )
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              billingInterval === "yearly" ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                billingInterval === "yearly" ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "yearly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Hàng năm
          </span>
          {billingInterval === "yearly" && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
              <Sparkles className="h-3 w-3" />
              Tiết kiệm {yearlySavings.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3 items-start">
          {/* Trial 3 Days */}
          <Card className="relative flex flex-col h-full border-primary/50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                🎁 MIỄN PHÍ 3 NGÀY
              </span>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Dùng thử Pro</CardTitle>
              <CardDescription>
                Trải nghiệm đầy đủ tính năng Pro
              </CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold">0đ</span>
                <span className="text-muted-foreground text-sm block mt-2">
                  3 ngày dùng thử
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {trialFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                size="lg"
                onClick={handleActivateTrial}
                disabled={isActivatingTrial}
              >
                {isActivatingTrial ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kích hoạt...
                  </>
                ) : (
                  "Dùng thử miễn phí 3 ngày"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Monthly Plan */}
          <Card
            className={cn(
              "relative flex flex-col h-full",
              billingInterval === "monthly" &&
                "border-primary shadow-lg shadow-primary/10 lg:scale-105"
            )}
          >
            {billingInterval === "monthly" && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Phổ Biến Nhất
                </span>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl">Pro Monthly</CardTitle>
                <ProBadge />
              </div>
              <CardDescription>
                Thanh toán hàng tháng, linh hoạt
              </CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold">
                  {monthlyPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-muted-foreground text-lg">/tháng</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  handleUpgrade(STRIPE_PRODUCTS.PRO_MONTHLY.priceId)
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Nâng cấp ngay"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Yearly Plan */}
          <Card
            className={cn(
              "relative flex flex-col h-full",
              billingInterval === "yearly" &&
                "border-primary shadow-lg shadow-primary/10 lg:scale-105"
            )}
          >
            {billingInterval === "yearly" && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Tiết kiệm nhất
                </span>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl">Pro Yearly</CardTitle>
                <ProBadge />
              </div>
              <CardDescription>
                Thanh toán 1 năm, tiết kiệm 2 tháng
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">
                    {yearlyMonthly.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-muted-foreground text-lg">/tháng</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanh toán {yearlyPrice.toLocaleString("vi-VN")}đ/năm
                </p>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  handleUpgrade(STRIPE_PRODUCTS.PRO_YEARLY.priceId)
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Nâng cấp ngay"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Tham gia cùng hàng ngàn người sáng tạo đang sử dụng VibeEditor để
            tạo ra những hình ảnh tuyệt đẹp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Dùng thử miễn phí</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/editor">Chỉnh sửa ngay</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
