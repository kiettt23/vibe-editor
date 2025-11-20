"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from "lucide-react";
import Link from "next/link";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ProBadge } from "@/components/shared/pro-badge";

const plans = [
  {
    name: "Miễn phí",
    price: "0đ",
    description: "Hoàn hảo để dùng thử VibeEditor",
    features: [
      "Dùng thử Pro 3 ngày khi đăng ký",
      "Lưu tối đa 5 dự án",
      "Filters cơ bản (Brightness, Contrast, Blur)",
      "3 preset filters (Original, Vintage, B&W)",
      "Transform tools (Flip, Rotate)",
      "Export PNG (2x resolution)",
      "Có watermark khi export",
    ],
    cta: "Bắt đầu ngay",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "199.000đ",
    period: "/tháng",
    description: "Dành cho người dùng chuyên nghiệp",
    features: [
      "Dự án không giới hạn",
      "TẤT CẢ filters nâng cao (Saturation, Hue)",
      "TẤT CẢ 10 preset filters cao cấp",
      "Không có watermark khi export",
      "Export tất cả định dạng (PNG, JPEG, WebP)",
      "Auto-save mọi thao tác",
      "Keyboard shortcuts (Ctrl+S, Ctrl+E, Ctrl+R)",
      "Hỗ trợ ưu tiên",
      "Truy cập sớm tính năng mới",
    ],
    cta: "Nâng cấp Pro",
    href: "/signup",
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 pt-28 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Trải nghiệm tốt nhất
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
          Bắt đầu miễn phí, nâng cấp khi cần thêm tính năng
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Phổ Biến Nhất
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.popular && <ProBadge />}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
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
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            So sánh chi tiết
          </h2>
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-semibold">Tính năng</th>
                      <th className="p-4 text-center font-semibold">
                        Miễn phí
                      </th>
                      <th className="p-4 text-center font-semibold bg-primary/5">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4 text-sm">Số lượng dự án</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        5 dự án
                      </td>
                      <td className="p-4 text-center text-sm bg-primary/5">
                        Không giới hạn
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Filters & Presets</td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Watermark</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        Có
                      </td>
                      <td className="p-4 text-center text-sm bg-primary/5 font-semibold">
                        Không
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Auto-save</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        ✕
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Keyboard Shortcuts</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        ✕
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Version History</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        ✕
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm">Hỗ trợ ưu tiên</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        ✕
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Câu Hỏi Thường Gặp
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Tôi có thể hủy đăng ký bất cứ lúc nào không?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Có! Bạn có thể hủy đăng ký Pro bất cứ lúc nào. Bạn vẫn sẽ được
                sử dụng cho đến hết kỳ thanh toán hiện tại.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Các phương thức thanh toán nào được chấp nhận?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Chúng tôi chấp nhận tất cả các thẻ tín dụng lớn (Visa,
                Mastercard, American Express) thông qua hệ thống thanh toán
                Stripe bảo mật.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Có hoàn tiền không?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Chúng tôi có chính sách hoàn tiền trong 14 ngày. Nếu không hài
                lòng, hãy liên hệ với chúng tôi để được hoàn tiền đầy đủ.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Điều gì xảy ra với dự án của tôi nếu tôi hạ cấp?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Dự án của bạn vẫn an toàn! Nếu bạn vượt quá giới hạn gói miễn
                phí (5 dự án), bạn sẽ không mất chúng. Bạn chỉ không thể tạo dự
                án mới cho đến khi xóa bớt hoặc nâng cấp lại.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Tham gia cùng hàng ngàn người sáng tạo đang sử dụng VibeEditor để
            tạo ra những hình ảnh tuyệt đẹp.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/editor">Chỉnh Sửa Miễn Phí</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Nâng Cấp Pro</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
