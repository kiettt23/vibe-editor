import React from "react";
import { Card } from "@/components/ui/card";
import { ImageUp, Sparkles, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ImageUp,
    title: "1. Tải ảnh lên",
    description: "Kéo thả ảnh vào editor hoặc click để chọn file từ máy tính",
  },
  {
    icon: Sparkles,
    title: "2. Chỉnh sửa",
    description:
      "Áp dụng filters, điều chỉnh brightness, contrast, saturation theo ý thích",
  },
  {
    icon: Download,
    title: "3. Export",
    description:
      "Tải về ảnh đã chỉnh sửa với chất lượng cao, định dạng PNG/JPEG/WebP",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Cách sử dụng</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Chỉ 3 bước đơn giản để có được ảnh đẹp hoàn hảo
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
            {steps.map((step, index) => (
              <div key={index} className="relative flex">
                <Card className="p-8 text-center hover:shadow-lg transition-shadow flex-1 flex flex-col">
                  <div className="flex justify-center mb-5">
                    <div className="p-4 rounded-full bg-linear-to-br from-primary/20 to-accent/20">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
