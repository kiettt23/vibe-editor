import { LoginForm } from "./_components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập | VibeEdit",
  description: "Đăng nhập để lưu và quản lý dự án chỉnh sửa ảnh của bạn",
};

export default function LoginPage() {
  return <LoginForm />;
}
