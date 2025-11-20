"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Thanh toán đã bị hủy</CardTitle>
          <CardDescription>
            Bạn đã hủy quá trình thanh toán. Không có khoản phí nào được tính.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Bạn vẫn muốn nâng cấp lên Pro?
                </p>
                <p className="text-sm text-muted-foreground">
                  Quay lại trang pricing và thử lại bất cứ lúc nào. Thẻ của bạn
                  sẽ không bị tính phí cho đến khi thanh toán thành công.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full h-12" size="lg">
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại Pricing
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard">Về Dashboard</Link>
            </Button>
          </div>

          {/* Support */}
          <div className="pt-4 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Gặp vấn đề khi thanh toán?
            </p>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="mailto:support@vibeeditor.com">Liên hệ hỗ trợ →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
