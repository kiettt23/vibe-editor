import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 bg-linear-to-br from-primary/5 via-primary/10 to-background">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            Sẵn sàng tạo ra những bức ảnh tuyệt vời?
          </h2>
          <p className="text-lg text-muted-foreground mb-7">
            Bắt đầu chỉnh sửa ảnh ngay hôm nay. Miễn phí, không cần đăng ký.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="default" className="h-10 px-6">
              <Link href="/editor">Bắt đầu chỉnh sửa - Miễn phí</Link>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="h-10 px-6"
            >
              <Link href="features">Xem tính năng</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
