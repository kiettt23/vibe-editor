"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Give webhook time to process (usually < 1 second)
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!sessionId) {
    router.push("/pricing");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-lg border-2">
        <CardHeader className="text-center pb-4">
          {isVerifying ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">
                Đang xử lý thanh toán...
              </CardTitle>
              <CardDescription>Vui lòng đợi trong giây lát</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">
                🎉 Thanh toán thành công!
              </CardTitle>
              <CardDescription>
                Tài khoản của bạn đã được nâng cấp lên Pro
              </CardDescription>
            </>
          )}
        </CardHeader>

        {!isVerifying && (
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Quyền lợi Pro của bạn:</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Tạo không giới hạn dự án
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sử dụng tất cả filters nâng cao (Saturation, Hue)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Tất cả 10 preset filters cao cấp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Export ảnh không watermark
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full h-12" size="lg">
                <Link href="/dashboard">
                  Về Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/editor">Bắt đầu chỉnh sửa ảnh</Link>
              </Button>
            </div>

            {/* Session ID (for support) */}
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Session ID: {sessionId.slice(0, 20)}...
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
