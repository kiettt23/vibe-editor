import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import {
  Upload,
  Sparkles,
  Wand2,
  Download,
  Save,
  Zap,
  Keyboard,
  Palette,
  FlipHorizontal,
  Image as ImageIcon,
  Shield,
  Clock,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description:
      "Kéo thả ảnh trực tiếp vào editor. Hỗ trợ đầy đủ JPG, PNG, WebP. Upload nhanh chóng, không giới hạn dung lượng.",
    badge: "Essential",
  },
  {
    icon: Palette,
    title: "Professional Filters",
    description:
      "Hơn 10 filters được thiết kế bởi chuyên gia: Vintage, Vibrant, Grayscale, Sepia, Warm, Cool, Dramatic, Soft. Áp dụng ngay lập tức với 1 click.",
    badge: "Popular",
  },
  {
    icon: Wand2,
    title: "Real-time Adjustments",
    description:
      "Điều chỉnh Brightness (-100 đến +100), Contrast (-100 đến +100), Saturation, Hue, Blur theo thời gian thực. Xem ngay kết quả trước mắt.",
    badge: "Essential",
  },
  {
    icon: FlipHorizontal,
    title: "Transform Tools",
    description:
      "Lật ngang, lật dọc, xoay ảnh. Reset tất cả transformations với 1 click. Hỗ trợ keyboard shortcuts (Ctrl+R).",
    badge: "Essential",
  },
  {
    icon: Save,
    title: "Auto-Save Projects",
    description:
      "Tự động lưu project sau 3 giây chỉnh sửa. Không bao giờ lo mất dữ liệu. Tiếp tục chỉnh sửa bất cứ lúc nào từ Dashboard.",
    badge: "Pro",
  },
  {
    icon: Download,
    title: "High-Quality Export",
    description:
      "Export PNG, JPEG, WebP với chất lượng cao. Hỗ trợ Retina display (2x resolution). Quality slider tùy chỉnh (0.1 - 1.0).",
    badge: "Essential",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail Generation",
    description:
      "Tự động tạo thumbnail cho mỗi project. Hiển thị trong Dashboard để dễ quản lý. Thumbnail được tối ưu hóa (25% size).",
    badge: "Pro",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description:
      "Ctrl+S: Save, Ctrl+E: Export, Ctrl+R: Reset, Escape: Close panel. Làm việc nhanh hơn gấp 3 lần với shortcuts.",
    badge: "Pro",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Chạy 100% trên browser với canvas API. Không cần server processing. Phản hồi tức thời với mọi thao tác.",
    badge: "Essential",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Ảnh của bạn không bao giờ rời khỏi máy tính cho đến khi bạn save. Mọi processing đều local. An toàn tuyệt đối.",
    badge: "Essential",
  },
  {
    icon: Clock,
    title: "Version History",
    description:
      "Mỗi lần save tạo 1 version mới. Canvas state được lưu chi tiết (filters, transforms). Quay lại version cũ bất cứ lúc nào.",
    badge: "Pro",
  },
  {
    icon: Sparkles,
    title: "No Watermark (Pro)",
    description:
      "Free tier có watermark nhỏ ở góc. Pro users export sạch sẽ, không watermark. Watermark text: 'Created with VibeEdit'.",
    badge: "Pro",
  },
];

const upcomingFeatures = [
  "AI Background Removal",
  "Text Tool với custom fonts",
  "Layer System (multi-layer editing)",
  "Shape Tools (rectangle, circle, polygon)",
  "Batch Processing (edit nhiều ảnh cùng lúc)",
  "Preset Management (save custom filter presets)",
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />

      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Mọi tính năng bạn cần
            <br />
            <span className="text-primary">Trong một công cụ</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            VibeEdit cung cấp đầy đủ tính năng chỉnh sửa ảnh chuyên nghiệp. Từ
            basic adjustments đến advanced filters, tất cả đều có sẵn.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/editor">
                <Sparkles className="mr-2 h-5 w-5" />
                Dùng thử miễn phí
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">Xem giá</Link>
            </Button>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tính năng hiện có
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge
                      variant={
                        feature.badge === "Pro" ? "default" : "secondary"
                      }
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">
              Tính năng sắp ra mắt
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Chúng tôi liên tục phát triển để mang đến trải nghiệm tốt nhất
            </p>
            <Card>
              <CardContent className="p-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-lg mb-8 opacity-90">
            Tạo tài khoản miễn phí và trải nghiệm ngay hôm nay
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Đăng ký miễn phí →</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
