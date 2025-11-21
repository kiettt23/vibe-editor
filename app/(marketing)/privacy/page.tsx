import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách Bảo mật - VibeEditor",
  description: "Chính sách bảo mật và quyền riêng tư của VibeEditor",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">Chính sách Bảo mật</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Thông tin chúng tôi thu thập
          </h2>
          <p>
            Khi bạn sử dụng VibeEditor, chúng tôi có thể thu thập các thông tin
            sau:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Thông tin tài khoản: Email, tên hiển thị, ảnh đại diện</li>
            <li>
              Dữ liệu dự án: Ảnh bạn tải lên, các chỉnh sửa, cài đặt dự án
            </li>
            <li>
              Thông tin thanh toán: Được xử lý bởi Stripe (chúng tôi không lưu
              trữ chi tiết thẻ)
            </li>
            <li>
              Dữ liệu sử dụng: Số lượng dự án, tính năng đã dùng, thời gian sử
              dụng
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Cách chúng tôi sử dụng thông tin
          </h2>
          <p>Thông tin của bạn được sử dụng để:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cung cấp và cải thiện dịch vụ</li>
            <li>Xử lý thanh toán và quản lý đăng ký</li>
            <li>Gửi thông báo về tài khoản và cập nhật sản phẩm</li>
            <li>Phân tích và cải thiện trải nghiệm người dùng</li>
            <li>Bảo mật và ngăn chặn gian lận</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Lưu trữ và bảo mật dữ liệu
          </h2>
          <p>
            Dữ liệu của bạn được lưu trữ an toàn trên Supabase (PostgreSQL) với:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Mã hóa dữ liệu khi truyền tải (SSL/TLS)</li>
            <li>Mã hóa dữ liệu khi lưu trữ (AES-256)</li>
            <li>Row Level Security (RLS) policies</li>
            <li>Backup tự động hàng ngày</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi KHÔNG bán hoặc cho thuê thông tin cá nhân của bạn. Thông
            tin chỉ được chia sẻ với:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Stripe - để xử lý thanh toán</li>
            <li>Supabase - để lưu trữ dữ liệu</li>
            <li>Vercel - để hosting website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Quyền của bạn</h2>
          <p>Bạn có quyền:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Truy cập và tải xuống dữ liệu của bạn</li>
            <li>Chỉnh sửa thông tin tài khoản</li>
            <li>Xóa tài khoản và dữ liệu</li>
            <li>Từ chối nhận email marketing</li>
            <li>Yêu cầu xuất dữ liệu (data export)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p>Chúng tôi sử dụng cookies cần thiết để:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Duy trì phiên đăng nhập</li>
            <li>Lưu tùy chọn người dùng</li>
            <li>Phân tích lưu lượng truy cập (nếu có Analytics)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Liên hệ</h2>
          <p>
            Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua trang
            Liên hệ trên website.
          </p>
        </section>
      </div>
    </div>
  );
}
