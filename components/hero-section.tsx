import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "./header";
import { Sparkles, Upload, Wand2, Image as ImageIcon } from "lucide-react";

export default function HeroSection() {
  return (
    <div>
      <HeroHeader />

      <main className="overflow-hidden">
        <section className="relative" id="hero">
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background -z-10" />

          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-8">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Photo Editor Online</span>
              </div>

              <h1 className="text-balance text-5xl font-bold md:text-7xl mb-6">
                Chỉnh sửa ảnh online
                <br />
                <span className="text-primary">Nhanh & Miễn phí</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground mb-12">
                Không cần cài đặt, không cần đăng ký. Chỉ cần kéo thả ảnh và bắt
                đầu sáng tạo. Công cụ chỉnh sửa ảnh chuyên nghiệp chạy ngay trên
                trình duyệt.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button asChild size="lg" className="text-lg">
                  <Link href="/editor">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Bắt đầu chỉnh sửa
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="#features">Xem tính năng</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 justify-center items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Drag & Drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <span>Professional Filters</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
