# 🎨 VibeEditor - Professional Online Image Editor

**Công cụ chỉnh sửa ảnh online mạnh mẽ, nhanh chóng, và dễ sử dụng. 100% chạy trên trình duyệt.**

---

## 📖 **About / Giới thiệu**

**VibeEditor** là dự án dự thi **Viet My Vibe Code Hackathon** - một cuộc thi lập trình nhằm tạo ra các sản phẩm công nghệ sáng tạo và hữu ích cho cộng đồng.

### 🎯 **Về dự án này**

Trong kỷ nguyên số, việc chỉnh sửa ảnh trở nên quan trọng hơn bao giờ hết. Tuy nhiên, nhiều công cụ chỉnh sửa ảnh hiện nay:
- Yêu cầu cài đặt phần mềm phức tạp
- Tốn kém chi phí (Adobe Photoshop, Lightroom...)
- Khó sử dụng với người dùng phổ thông
- Cần tải ảnh lên server (lo ngại về bảo mật)

**VibeEditor** được tạo ra để giải quyết những vấn đề này với một giải pháp:
- ✨ **100% Browser-based** - Không cần cài đặt, chạy hoàn toàn trên trình duyệt
- 🔒 **Privacy First** - Ảnh được xử lý local, không upload lên server
- 🚀 **Fast & Responsive** - Tối ưu hiệu năng, phản hồi tức thì
- 💰 **Freemium Model** - Free tier đầy đủ tính năng cơ bản, Pro cho nhu cầu nâng cao
- 🎨 **Professional Quality** - Filters và công cụ chỉnh sửa chuyên nghiệp
- 📱 **Cross-platform** - Hoạt động trên mọi thiết bị (Desktop, Tablet, Mobile)

### 🏆 **Viet My Vibe Code Hackathon**

Dự án này được phát triển cho **Viet My Vibe Code Hackathon** với mục tiêu:
- Tạo ra một công cụ thực tế, hữu ích cho người dùng Việt Nam
- Áp dụng công nghệ web hiện đại (Next.js 16, React 19, Supabase)
- Xây dựng sản phẩm có tính thương mại hóa (monetization với Stripe)
- Thể hiện kỹ năng full-stack development từ Frontend đến Backend, Database, và Payment
- Tạo ra trải nghiệm người dùng (UX/UI) chuyên nghiệp và dễ sử dụng

**Đội ngũ:** Kiet Tran (@kiettt23)  
**Timeline:** Phát triển trong khuôn khổ Viet My Vibe Code Hackathon  
**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Stripe, Konva.js

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-purple?style=flat-square&logo=stripe)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📸 **Demo**

🌐 **Live Demo:** [https://vibe-editor-ten.vercel.app](https://vibe-editor-ten.vercel.app)

![VibeEditor Screenshot](./public/screenshot.png)

---

## ✨ **Features**

### **🎨 Core Editor**

- ✅ **Drag & Drop Upload** - Kéo thả ảnh trực tiếp vào editor
- ✅ **Real-time Adjustments** - Điều chỉnh Brightness, Contrast, Saturation, Hue, Blur
- ✅ **Transform Tools** - Flip, Rotate, Scale, Zoom
- ✅ **10 Professional Filters** - Instagram-style presets (Vintage, Vibrant, B&W, Sepia...)
- ✅ **Keyboard Shortcuts** - Ctrl+S (Save), Ctrl+E (Export), Ctrl+R (Reset), Esc (Close)
- ✅ **High-Quality Export** - PNG, JPEG, WebP với quality control
- ✅ **Auto-save** - Tự động lưu project sau 3 giây

### **💼 Project Management**

- ✅ **Dashboard** - Quản lý tất cả projects trong một nơi
- ✅ **Thumbnail Generation** - Tự động tạo preview cho mỗi project
- ✅ **Project Limits** - Free: 5 projects, Pro: Unlimited
- ✅ **Stats Cards** - Xem tổng quan projects, last updated

### **🔐 Authentication**

- ✅ **Email/Password** - Signup và Login truyền thống
- ✅ **OAuth Google** - Đăng nhập nhanh bằng Google
- ✅ **Multi-Session** - Quản lý nhiều accounts, switch dễ dàng
- ✅ **User Profiles** - Avatar, name, email management

### **💳 Monetization**

- ✅ **Stripe Integration** - Checkout flow cho Pro plans
- ✅ **Monthly/Yearly Plans** - Thanh toán linh hoạt
- ✅ **3-day Free Trial** - Dùng thử Pro miễn phí
- ✅ **Billing Portal** - Cancel, update payment methods
- ✅ **Webhook Automation** - Tự động sync subscription status

### **🎯 UI/UX**

- ✅ **Responsive Design** - Hoạt động trên mọi thiết bị
- ✅ **Dark Mode** - Tự động theo system preference
- ✅ **Loading States** - Skeleton loaders everywhere
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Toast Notifications** - Real-time feedback
- ✅ **Pro Gate Modal** - Lock features cho Free users

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- Stripe account

### **Installation**

```bash
# Clone repository
git clone https://github.com/kiettt23/vibe-editor.git
cd vibe-editor

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup environment variables (see below)
# Edit .env file with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **Environment Variables**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (Test Mode for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_xxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Hướng dẫn chi tiết:** [ENV_SETUP.md](./ENV_SETUP.md)

**Quick links:**

- **Supabase:** [Supabase Dashboard](https://supabase.com/dashboard)
- **Stripe:** [Stripe Dashboard](https://dashboard.stripe.com/)
- **Google OAuth:** [Google Cloud Console](https://console.cloud.google.com/)

---

## 📦 **Tech Stack**

### **Frontend**

- **Framework:** Next.js 16.0 (App Router)
- **UI Library:** React 19.2
- **Styling:** Tailwind CSS 4
- **Component Library:** shadcn/ui + Radix UI
- **Canvas:** Konva.js + React-Konva
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

### **Backend**

- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js Server Actions
- **Payments:** Stripe v20

### **DevOps**

- **Hosting:** Vercel
- **CI/CD:** Vercel Git Integration
- **Monitoring:** Vercel Analytics _(Optional: Sentry)_

---

## 📂 **Project Structure**

```
vibe-editor/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, signup)
│   ├── (marketing)/         # Public pages (landing, features, pricing)
│   ├── dashboard/           # User dashboard
│   ├── editor/              # Image editor workspace
│   ├── payment/             # Payment success/cancel pages
│   ├── actions/             # Server actions (auth, projects, subscription)
│   └── api/                 # API routes (Stripe webhook)
├── components/
│   ├── editor/              # Editor components (Canvas, Toolbar, Panels)
│   ├── marketing/           # Marketing sections (Hero, Features, Pricing)
│   ├── shared/              # Shared components (Header, Footer, Logo)
│   └── ui/                  # shadcn/ui components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities
│   ├── editor/              # Editor utilities (filters, export)
│   ├── stripe/              # Stripe helpers
│   ├── subscription/        # Subscription logic
│   └── supabase/            # Supabase clients
├── store/                    # Zustand stores
├── types/                    # TypeScript types
├── supabase/
│   └── migrations/          # Database migrations
├── docs/                     # Documentation
│   ├── DEPLOYMENT_GUIDE.md  # Production deployment guide
│   ├── ROADMAP.md           # Feature roadmap
│   └── STRIPE_SETUP_GUIDE.md
└── public/                   # Static assets
```

---

## 🗺️ **Roadmap**

Xem chi tiết tại [ROADMAP.md](./ROADMAP.md)

### **Phase 2 - Advanced Editor (Q1 2026)**

- [ ] Text Tool với custom fonts
- [ ] Shape Tools (Rectangle, Circle, Polygon)
- [ ] Layer System
- [ ] Advanced Filters (Curves, Levels)

### **Phase 3 - AI Features (Q2 2026)**

- [ ] AI Background Removal
- [ ] AI Image Upscale
- [ ] AI Object Removal
- [ ] AI Auto-Enhance

### **Phase 4 - Collaboration (Q3 2026)**

- [ ] Team Workspaces
- [ ] Real-time Collaboration
- [ ] Comments & Annotations

### **Phase 5 - Advanced (Q4 2026)**

- [ ] Batch Processing
- [ ] Preset Management
- [ ] Animation Export
- [ ] AI-Generated Images

---

## 🤝 **Contributing**

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Guidelines:**

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features (if applicable)
- Update documentation

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Stripe](https://stripe.com/) - Payment Infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Konva.js](https://konvajs.org/) - Canvas Library
- [Vercel](https://vercel.com/) - Deployment Platform

---

## 📞 **Contact**

- **Author:** Kiet Tran (@kiettt23)
- **Email:** support@vibeeditor.vn _(Coming Soon)_
- **GitHub:** [https://github.com/kiettt23/vibe-editor](https://github.com/kiettt23/vibe-editor)
- **Issues:** [https://github.com/kiettt23/vibe-editor/issues](https://github.com/kiettt23/vibe-editor/issues)

---

## 📊 **Stats**

![GitHub stars](https://img.shields.io/github/stars/kiettt23/vibe-editor?style=social)
![GitHub forks](https://img.shields.io/github/forks/kiettt23/vibe-editor?style=social)
![GitHub issues](https://img.shields.io/github/issues/kiettt23/vibe-editor)
![GitHub last commit](https://img.shields.io/github/last-commit/kiettt23/vibe-editor)

---

**Made with ❤️ by Kiet Tran**
