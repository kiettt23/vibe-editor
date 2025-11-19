import React from "react";
import { Users, Image as ImageIcon, Star, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Người dùng đang hoạt động",
  },
  {
    icon: ImageIcon,
    value: "50,000+",
    label: "Ảnh đã được chỉnh sửa",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Đánh giá trung bình",
  },
  {
    icon: TrendingUp,
    value: "99.9%",
    label: "Uptime đảm bảo",
  },
];

export default function StatsSection() {
  return (
    <section className="py-14 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2.5">
                <stat.icon className="w-7 h-7 opacity-90" />
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1.5">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
