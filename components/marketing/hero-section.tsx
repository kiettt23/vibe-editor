import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/shared/header";
import { Boxes } from "@/components/ui/background-boxes";
import { Sparkles, Upload, Wand2, Image as ImageIcon } from "lucide-react";

export default function HeroSection() {
  return (
    <div>
      <HeroHeader />

      <main className="overflow-hidden">
        <section className="relative min-h-screen flex items-center" id="hero">
          {/* Background Boxes Animation */}
          <div className="absolute inset-0 w-full h-full bg-background overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-background z-20 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
            <Boxes />
          </div>

          {/* Gradient overlay for smoother blend */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background z-10 pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-6 py-20 z-20">
            <div className="relative mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 mb-6 pointer-events-auto">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Photo Editor Online</span>
              </div>

              <h1 className="text-balance text-4xl font-bold md:text-6xl mb-6 leading-tight pointer-events-none">
                Chỉnh sửa ảnh online
                <br />
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Nhanh & Miễn phí
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-pretty text-base text-muted-foreground mb-10 leading-relaxed pointer-events-none">
                Không cần cài đặt, không cần đăng ký. Chỉ cần kéo thả ảnh và bắt
                đầu sáng tạo. Công cụ chỉnh sửa ảnh chuyên nghiệp chạy ngay trên
                trình duyệt.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 pointer-events-auto">
                <Button
                  asChild
                  size="default"
                  className="text-base px-6 py-3 h-fit"
                >
                  <Link href="/editor">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Bắt đầu chỉnh sửa
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="text-base px-6 py-3 h-fit"
                >
                  <Link href="#features">Xem tính năng</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-muted-foreground pointer-events-none">
                <div className="flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  <span>Drag & Drop</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-3.5 w-3.5 text-primary" />
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
