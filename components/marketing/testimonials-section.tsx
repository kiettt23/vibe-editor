import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Nguyễn Văn A",
    role: "Graphic Designer",
    avatar: "NA",
    content:
      "VibeEditor giúp tôi chỉnh sửa ảnh nhanh chóng mà không cần mở Photoshop. Filters rất đẹp và dễ sử dụng!",
    rating: 5,
  },
  {
    name: "Trần Thị B",
    role: "Content Creator",
    avatar: "TB",
    content:
      "Tính năng auto-save rất hay, không bao giờ lo mất công chỉnh sửa. Export chất lượng cao, rất hài lòng!",
    rating: 5,
  },
  {
    name: "Lê Minh C",
    role: "Photographer",
    avatar: "LC",
    content:
      "Công cụ online mạnh nhất tôi từng dùng. Keyboard shortcuts giúp tôi làm việc nhanh hơn rất nhiều.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Người dùng nói gì về VibeEditor
          </h2>
          <p className="text-lg text-muted-foreground">
            Hàng nghìn người đã tin dùng VibeEditor cho công việc hàng ngày
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {testimonial.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
