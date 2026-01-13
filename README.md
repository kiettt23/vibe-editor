# 🎨 VibeEditor - Professional Online Image Editor

<div align="center">

### 🏆 **TOP 4 FINALIST - VIET MY VIBE CODE HACKATHON 2026** 🏆

_Qualified from Round 1 to Finals | Solo Project_

[![Hackathon](https://img.shields.io/badge/🏆_Viet_My_Vibe_Code_Hackathon-Top_4_Finalist-gold?style=for-the-badge)](https://vibe-editor-ten.vercel.app)

</div>

---

**A powerful, fast, and easy-to-use online image editor runs in your browser.**

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

## 💡 **Why This Project Stands Out**

> **A complete production-ready SaaS built solo from scratch in 2 weeks.**

| Aspect          | What I Built                                                                           |
| --------------- | -------------------------------------------------------------------------------------- |
| 🎨 **Frontend** | Real-time Canvas editing with Konva.js, 10+ filters, keyboard shortcuts, responsive UI |
| 🔐 **Auth**     | OAuth (Google) + Email/Password, multi-session support, Supabase Auth                  |
| 💳 **Payments** | Full Stripe integration: checkout, subscriptions, webhooks, billing portal             |
| 📦 **Backend**  | Server Actions, PostgreSQL database, file storage, API routes                          |
| 🚀 **DevOps**   | CI/CD with Vercel, environment management, production deployment                       |
| 🎯 **Product**  | Freemium model, project limits, usage tracking, onboarding flow                        |

**Key Achievements:**

- ✅ Built a **complete SaaS product** - not just a demo or proof-of-concept
- ✅ Implemented **real business logic** - subscriptions, trials, billing management
- ✅ **100% client-side image processing** - zero server load for editing operations
- ✅ Modern stack: **Next.js 16 + React 19 + TypeScript** (latest versions)

---

## ✨ **Features**

### **🎨 Core Editor**

- ✅ **Drag & Drop Upload** - Drop images directly into the editor
- ✅ **Real-time Adjustments** - Brightness, Contrast, Saturation, Hue, Blur controls
- ✅ **Transform Tools** - Flip, Rotate, Scale, Zoom
- ✅ **10 Professional Filters** - Instagram-style presets (Vintage, Vibrant, B&W, Sepia...)
- ✅ **Keyboard Shortcuts** - Ctrl+S (Save), Ctrl+E (Export), Ctrl+R (Reset), Esc (Close)
- ✅ **High-Quality Export** - PNG, JPEG, WebP with quality control
- ✅ **Auto-save** - Automatically saves project after 3 seconds

### **💼 Project Management**

- ✅ **Dashboard** - Manage all projects in one place
- ✅ **Thumbnail Generation** - Auto-generated previews for each project
- ✅ **Project Limits** - Free: 5 projects, Pro: Unlimited
- ✅ **Stats Cards** - Overview of projects, last updated

### **🔐 Authentication**

- ✅ **Email/Password** - Traditional signup and login
- ✅ **OAuth Google** - Quick sign-in with Google
- ✅ **Multi-Session** - Manage multiple accounts, easy switching
- ✅ **User Profiles** - Avatar, name, email management

### **💳 Monetization**

- ✅ **Stripe Integration** - Checkout flow for Pro plans
- ✅ **Monthly/Yearly Plans** - Flexible billing options
- ✅ **3-day Free Trial** - Try Pro for free
- ✅ **Billing Portal** - Cancel, update payment methods
- ✅ **Webhook Automation** - Auto-sync subscription status

### **🎯 UI/UX**

- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark Mode** - Follows system preference
- ✅ **Loading States** - Skeleton loaders everywhere
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Toast Notifications** - Real-time feedback
- ✅ **Pro Gate Modal** - Lock features for Free users

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
- **Monitoring:** Vercel Analytics

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

### **Phase 2 - Advanced Editor**

- [ ] Text Tool with custom fonts
- [ ] Shape Tools (Rectangle, Circle, Polygon)
- [ ] Layer System
- [ ] Advanced Filters (Curves, Levels)

### **Phase 3 - AI Features**

- [ ] AI Background Removal
- [ ] AI Image Upscale
- [ ] AI Object Removal
- [ ] AI Auto-Enhance

### **Phase 4 - Collaboration**

- [ ] Team Workspaces
- [ ] Real-time Collaboration
- [ ] Comments & Annotations

### **Phase 5 - Advanced**

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
- **Email:** kiettt23@gmail.com
- **GitHub:** [https://github.com/kiettt23/vibe-editor](https://github.com/kiettt23/vibe-editor)
- **Issues:** [https://github.com/kiettt23/vibe-editor/issues](https://github.com/kiettt23/vibe-editor/issues)

---

## 📊 **Stats**

![GitHub stars](https://img.shields.io/github/stars/kiettt23/vibe-editor?style=social)
![GitHub forks](https://img.shields.io/github/forks/kiettt23/vibe-editor?style=social)
![GitHub issues](https://img.shields.io/github/issues/kiettt23/vibe-editor)
![GitHub last commit](https://img.shields.io/github/last-commit/kiettt23/vibe-editor)

---

**Made by Kiet**
