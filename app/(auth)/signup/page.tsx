import { Suspense } from "react";
import { SignupForm } from "./_components/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký | VibeEditor",
  description: "Tạo tài khoản để sử dụng đầy đủ tính năng chỉnh sửa ảnh",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
