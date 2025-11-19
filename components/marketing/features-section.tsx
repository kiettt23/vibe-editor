import React from "react";
import Link from "next/link";
import { Upload, Sparkles, Wand2, Layers, Type, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description:
      "Chỉ cần kéo thả ảnh vào trình duyệt. Hỗ trợ JPG, PNG, WebP. Tải lên nhanh chóng và bảo mật.",
  },
  {
    icon: Sparkles,
    title: "Professional Filters",
    description:
      "Hơn 10 filters chuyên nghiệp sẵn có. Từ Vintage, Vibrant đến Black & White. Áp dụng ngay lập tức.",
  },
  {
    icon: Wand2,
    title: "Real-time Editing",
    description:
      "Chỉnh sửa Brightness, Contrast, Saturation, Hue theo thời gian thực. Xem ngay kết quả trước mắt.",
  },
  {
    icon: Layers,
    title: "Transform Tools",
    description:
      "Lật ngang, lật dọc, xoay ảnh dễ dàng. Tất cả đều có keyboard shortcuts tiện lợi.",
  },
  {
    icon: Type,
    title: "Auto-Save Projects",
    description:
      "Không lo mất dữ liệu. Tự động lưu sau 3 giây. Tiếp tục chỉnh sửa bất cứ lúc nào.",
  },
  {
    icon: Download,
    title: "High-Quality Export",
    description:
      "Export PNG, JPEG, WebP với chất lượng cao. Hỗ trợ Retina display (2x resolution).",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Mọi thứ bạn cần để chỉnh sửa ảnh
          </h2>
          <p className="text-lg text-muted-foreground">
            Công cụ chỉnh sửa ảnh online mạnh mẽ, dễ sử dụng, và hoàn toàn miễn
            phí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="default" className="h-10 px-6">
            <Link href="/editor">Bắt đầu miễn phí →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
