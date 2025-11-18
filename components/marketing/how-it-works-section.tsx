import React from "react";
import { Card } from "@/components/ui/card";
import { Upload, Wand2, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Tải ảnh lên",
    description: "Kéo thả ảnh vào editor hoặc click để chọn file từ máy tính",
  },
  {
    icon: Wand2,
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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Cách sử dụng</h2>
          <p className="text-xl text-muted-foreground">
            Chỉ 3 bước đơn giản để có được ảnh đẹp hoàn hảo
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-center">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
