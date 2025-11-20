import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Miễn phí",
    price: "0đ",
    description: "Hoàn hảo để dùng thử VibeEditor",
    features: [
      "Chỉnh sửa cơ bản không giới hạn",
      "Lưu tối đa 5 dự án",
      "Tất cả bộ lọc cơ bản",
      "10 bộ lọc preset Instagram",
      "Export PNG/JPG (tối đa 2048x2048)",
      "Xóa phông AI (5 lần/tháng)",
      "Có watermark khi export",
    ],
    cta: "Bắt đầu ngay",
    href: "/editor",
    popular: false,
  },
  {
    name: "Pro",
    price: "199.000đ",
    period: "/tháng",
    description: "Dành cho chuyên gia cần nhiều tính năng hơn",
    features: [
      "Tất cả tính năng Miễn phí",
      "Dự án không giới hạn",
      "Không có watermark",
      "Export 4K (tối đa 4096x4096)",
      "Xóa phông AI (100 lần/tháng)",
      "Hỗ trợ ưu tiên",
      "Truy cập sớm tính năng mới",
      "Tùy chỉnh thương hiệu",
    ],
    cta: "Nâng cấp Pro",
    href: "/signup",
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Trải nghiệm tốt nhất
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Bắt đầu miễn phí, nâng cấp khi cần thêm tính năng
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.popular ? "border-primary shadow-lg relative" : ""
              }`}
            >
              {plan.popular && (
                <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
                  Phổ Biến Nhất
                </span>
              )}

              <CardHeader>
                <CardTitle className="text-2xl font-medium">
                  {plan.name}
                </CardTitle>
                <div className="my-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <hr className="border-dashed" />
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
