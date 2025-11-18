import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24 bg-linear-to-br from-primary/5 via-primary/10 to-background">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng tạo ra những bức ảnh tuyệt vời?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Bắt đầu chỉnh sửa ảnh ngay hôm nay. Miễn phí, không cần đăng ký.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/editor">Bắt đầu chỉnh sửa - Miễn phí</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              <Link href="features">Xem tính năng</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
