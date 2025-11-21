import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản Dịch vụ - VibeEditor",
  description: "Điều khoản và điều kiện sử dụng VibeEditor",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">Điều khoản Dịch vụ</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Chấp nhận Điều khoản
          </h2>
          <p>
            Bằng việc truy cập và sử dụng VibeEditor, bạn đồng ý tuân thủ các
            điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Mô tả Dịch vụ</h2>
          <p>VibeEditor là công cụ chỉnh sửa ảnh trực tuyến cung cấp:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bộ lọc và hiệu ứng chuyên nghiệp</li>
            <li>Công cụ điều chỉnh ảnh</li>
            <li>Lưu trữ và quản lý dự án</li>
            <li>Xuất ảnh chất lượng cao</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Tài khoản Người dùng
          </h2>
          <p>Khi tạo tài khoản, bạn cam kết:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cung cấp thông tin chính xác và đầy đủ</li>
            <li>Bảo mật mật khẩu của bạn</li>
            <li>
              Chịu trách nhiệm cho mọi hoạt động dưới tài khoản của bạn
            </li>
            <li>Thông báo ngay nếu phát hiện truy cập trái phép</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Gói Đăng ký</h2>

          <h3 className="text-xl font-semibold mb-2">4.1. Gói Miễn phí</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tối đa 5 dự án</li>
            <li>Ảnh xuất có watermark</li>
            <li>Tất cả tính năng cơ bản</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.2. Gói Pro</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Không giới hạn dự án</li>
            <li>Không watermark</li>
            <li>Tất cả tính năng nâng cao</li>
            <li>Giá: 99.000đ/tháng hoặc 990.000đ/năm</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">
            4.3. Gói Dùng thử
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>3 ngày dùng thử Pro miễn phí</li>
            <li>Chỉ áp dụng 1 lần cho mỗi người dùng</li>
            <li>Tự động hết hạn, không tự động gia hạn</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Thanh toán và Hoàn tiền
          </h2>

          <h3 className="text-xl font-semibold mb-2">5.1. Thanh toán</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Thanh toán qua Stripe (thẻ tín dụng/ghi nợ)</li>
            <li>Tự động gia hạn hàng tháng/năm</li>
            <li>Giá có thể thay đổi với thông báo trước 30 ngày</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">5.2. Hủy đăng ký</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn có thể hủy bất kỳ lúc nào</li>
            <li>Truy cập vẫn còn cho đến hết chu kỳ thanh toán</li>
            <li>Không hoàn lại tiền cho thời gian chưa sử dụng</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">5.3. Hoàn tiền</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hoàn tiền 100% trong vòng 7 ngày đầu tiên</li>
            <li>Liên hệ qua trang Liên hệ trên website để yêu cầu</li>
            <li>Xử lý trong 5-7 ngày làm việc</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Nội dung Người dùng
          </h2>

          <h3 className="text-xl font-semibold mb-2">6.1. Quyền sở hữu</h3>
          <p>
            Bạn giữ quyền sở hữu đầy đủ đối với ảnh và nội dung bạn tải lên.
            Chúng tôi không sử dụng nội dung của bạn cho bất kỳ mục đích nào
            khác ngoài việc cung cấp dịch vụ.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">
            6.2. Nội dung bị cấm
          </h3>
          <p>Bạn KHÔNG được tải lên:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nội dung vi phạm bản quyền</li>
            <li>Nội dung khiêu dâm, bạo lực</li>
            <li>Nội dung phân biệt chủng tộc, kỳ thị</li>
            <li>Malware, virus, mã độc</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Giới hạn Trách nhiệm
          </h2>
          <p>
            VibeEditor được cung cấp &quot;NGUYÊN TRẠNG&quot;. Chúng tôi không
            chịu trách nhiệm cho:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Mất dữ liệu hoặc dự án (khuyến nghị backup thường xuyên)</li>
            <li>Gián đoạn dịch vụ (maintenance, lỗi server)</li>
            <li>Thiệt hại gián tiếp từ việc sử dụng dịch vụ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            8. Thay đổi Điều khoản
          </h2>
          <p>
            Chúng tôi có quyền cập nhật điều khoản này bất kỳ lúc nào. Thay đổi
            quan trọng sẽ được thông báo qua email hoặc banner trên website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. Chấm dứt Tài khoản
          </h2>
          <p>Chúng tôi có quyền chấm dứt tài khoản của bạn nếu:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Vi phạm điều khoản dịch vụ</li>
            <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
            <li>Lạm dụng hoặc spam hệ thống</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Luật áp dụng</h2>
          <p>
            Điều khoản này tuân theo luật pháp Việt Nam. Mọi tranh chấp sẽ được
            giải quyết tại tòa án có thẩm quyền.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Liên hệ</h2>
          <p>
            Nếu có câu hỏi về điều khoản dịch vụ, vui lòng liên hệ qua trang
            Liên hệ trên website.
          </p>
        </section>
      </div>
    </div>
  );
}
