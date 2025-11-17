import React from 'react'
import Link from 'next/link'
import { Upload, Sparkles, Wand2, Layers, Type, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    description: 'Chỉ cần kéo thả ảnh vào trình duyệt. Hỗ trợ JPG, PNG, WebP.',
  },
  {
    icon: Sparkles,
    title: 'Professional Filters',
    description: 'Áp dụng filters chuyên nghiệp trong 1 click. Blur, Brightness, Contrast và nhiều hơn nữa.',
  },
  {
    icon: Wand2,
    title: 'AI Background Removal',
    description: 'Xóa phông nền tự động với AI. Chính xác và nhanh chóng chỉ trong vài giây.',
  },
  {
    icon: Layers,
    title: 'Layer System',
    description: 'Quản lý nhiều layers như Photoshop. Thêm, xóa, reorder dễ dàng.',
  },
  {
    icon: Type,
    title: 'Text Tool',
    description: 'Thêm text với custom fonts, màu sắc, và effects chuyên nghiệp.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Tải về PNG hoặc JPG với resolution tùy chọn. Từ HD đến 4K.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Mọi thứ bạn cần để chỉnh sửa ảnh
          </h2>
          <p className="text-xl text-muted-foreground">
            Công cụ chỉnh sửa ảnh online mạnh mẽ, dễ sử dụng, và hoàn toàn miễn phí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg">
            <Link href="/editor">
              Bắt đầu miễn phí →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
