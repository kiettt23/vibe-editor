# ✅ PRODUCTION DEPLOYMENT CHECKLIST

**Checklist đầy đủ trước khi deploy version 1.0.0 lên production.**

---

## 📋 **PRE-DEPLOYMENT**

### **1. Code Quality** ✅

- [x] All TypeScript errors fixed
- [x] No console.log/debug code (except necessary logs)
- [x] No TODO comments left unresolved
- [x] Code reviewed and refactored
- [x] Unused files deleted
- [x] .env.example updated with all variables

### **2. Documentation** ✅

- [x] README.md complete
- [x] DEPLOYMENT_GUIDE.md created
- [x] ENV_SETUP.md created
- [x] ROADMAP.md created
- [x] CHANGELOG.md created
- [x] CONTRIBUTING.md created
- [x] LICENSE file added

### **3. Database**

- [ ] All migrations tested locally
- [ ] Database schema verified
- [ ] RLS policies tested
- [ ] Triggers working correctly
- [ ] Storage bucket created
- [ ] Storage policies configured

### **4. Environment Variables**

**Development:**

- [ ] NEXT_PUBLIC_SUPABASE_URL (dev)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (dev)
- [ ] SUPABASE_SERVICE_ROLE_KEY (dev)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test)
- [ ] STRIPE_SECRET_KEY (test)
- [ ] STRIPE_WEBHOOK_SECRET (test)
- [ ] NEXT_PUBLIC_STRIPE_PRICE_MONTHLY (test)
- [ ] NEXT_PUBLIC_STRIPE_PRICE_YEARLY (test)
- [ ] NEXT_PUBLIC_SITE_URL=http://localhost:3000

**Production:**

- [ ] NEXT_PUBLIC_SUPABASE_URL (prod)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (prod)
- [ ] SUPABASE_SERVICE_ROLE_KEY (prod)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live)
- [ ] STRIPE_SECRET_KEY (live)
- [ ] STRIPE_WEBHOOK_SECRET (live)
- [ ] NEXT_PUBLIC_STRIPE_PRICE_MONTHLY (live)
- [ ] NEXT_PUBLIC_STRIPE_PRICE_YEARLY (live)
- [ ] NEXT_PUBLIC_SITE_URL (production domain)

---

## 🗄️ **DATABASE SETUP (SUPABASE)**

### **Production Database**

- [ ] Create new Supabase project (production)
- [ ] Name: `vibe-editor-production`
- [ ] Region: Southeast Asia (Singapore)
- [ ] Strong password generated and saved

### **Migrations**

- [ ] Link Supabase CLI to production: `supabase link`
- [ ] Push migrations: `supabase db push`
- [ ] Verify tables created:
  - [ ] `user_profiles`
  - [ ] `user_subscriptions`
  - [ ] `projects`

### **Storage**

- [ ] Create bucket: `project-images`
- [ ] Set public access: true
- [ ] Configure policies:
  - [ ] Public read
  - [ ] Authenticated upload
  - [ ] Users delete own

### **Authentication**

- [ ] Email/Password enabled
- [ ] OAuth Google configured:
  - [ ] Client ID added
  - [ ] Client Secret added
  - [ ] Redirect URL copied
- [ ] Google Cloud Console updated:
  - [ ] Authorized redirect URI: `https://xxx.supabase.co/auth/v1/callback`
  - [ ] Authorized JavaScript origins: production domain

### **API Keys**

- [ ] Project URL copied
- [ ] Anon key copied
- [ ] Service role key copied (keep secret!)

---

## 💳 **STRIPE SETUP (LIVE MODE)**

### **Switch to Live Mode**

- [ ] Stripe Dashboard > Toggle **"View test data" OFF**
- [ ] Verify in Live Mode (check top-left corner)

### **Products & Prices**

**Pro Monthly:**

- [ ] Create product: "VibeEditor Pro - Monthly"
- [ ] Price: 199,000 VND (or your price)
- [ ] Billing: Monthly
- [ ] Copy Price ID: `price_xxx`

**Pro Yearly:**

- [ ] Create product: "VibeEditor Pro - Yearly"
- [ ] Price: 1,900,000 VND (save 20%)
- [ ] Billing: Yearly
- [ ] Copy Price ID: `price_yyy`

### **API Keys**

- [ ] Copy Publishable key: `pk_live_xxx`
- [ ] Copy Secret key: `sk_live_xxx` (keep secret!)

### **Webhook (TẠM THỜI BỎ QUA - UPDATE SAU KHI DEPLOY)**

_Webhook URL sẽ được update sau khi có production domain từ Vercel._

---

## 🚀 **VERCEL DEPLOYMENT**

### **Git & GitHub**

- [ ] All changes committed:
  ```bash
  git add .
  git commit -m "feat: production ready v1.0.0"
  ```
- [ ] Pushed to GitHub:
  ```bash
  git push origin main
  ```
- [ ] Tag version:
  ```bash
  git tag v1.0.0
  git push --tags
  ```

### **Vercel Project**

- [ ] Create Vercel account (if not exists)
- [ ] Import GitHub repository: `vibe-editor`
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build` (default)

### **Environment Variables in Vercel**

Copy tất cả variables từ production section vào Vercel:

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (mark as secret)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY (mark as secret)
- [ ] STRIPE_WEBHOOK_SECRET (mark as secret)
- [ ] NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
- [ ] NEXT_PUBLIC_STRIPE_PRICE_YEARLY
- [ ] NEXT_PUBLIC_SITE_URL (use Vercel preview URL first)

### **Deploy**

- [ ] Click **Deploy** button
- [ ] Wait 3-5 minutes
- [ ] Deployment successful? ✅
- [ ] Copy Vercel domain: `https://xxx.vercel.app`

---

## 🔄 **POST-DEPLOYMENT UPDATES**

### **Update NEXT_PUBLIC_SITE_URL**

- [ ] Go to Vercel > Environment Variables
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Redeploy: Vercel > Deployments > Redeploy

### **Update Stripe Webhook**

- [ ] Stripe Dashboard > Developers > Webhooks
- [ ] Click **"Add endpoint"**
- [ ] Endpoint URL: `https://xxx.vercel.app/api/stripe/webhook`
- [ ] Select events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Copy **Signing secret**: `whsec_xxx`
- [ ] Update Vercel env var: `STRIPE_WEBHOOK_SECRET`
- [ ] Redeploy

### **Update OAuth Redirect URLs**

**Google Cloud Console:**

- [ ] Authorized redirect URIs:
  - [ ] Add: `https://xxx.supabase.co/auth/v1/callback`
  - [ ] Add: `https://xxx.vercel.app/auth/callback`
- [ ] Authorized JavaScript origins:
  - [ ] Add: `https://xxx.vercel.app`

---

## 🧪 **TESTING IN PRODUCTION**

### **Basic Functionality**

- [ ] Website loads: `https://xxx.vercel.app`
- [ ] Landing page renders correctly
- [ ] Features page loads
- [ ] Pricing page loads

### **Authentication**

- [ ] Signup with email/password works
- [ ] Login with email/password works
- [ ] OAuth Google works
- [ ] Logout works
- [ ] Multi-session works (switch accounts)

### **Projects**

- [ ] Create new project works
- [ ] Upload image works
- [ ] Edit image (filters, adjustments) works
- [ ] Save project works (auto-save)
- [ ] Export image works
- [ ] Delete project works
- [ ] Dashboard displays projects

### **Payments (Use Real Card or Test Card)**

**Test Card:**

```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

- [ ] Click "Nâng cấp Pro" on pricing page
- [ ] Redirects to Stripe Checkout
- [ ] Fill payment info
- [ ] Click "Pay"
- [ ] Redirects to success page
- [ ] Dashboard shows "Pro" badge
- [ ] Projects limit removed (can create 6+ projects)

### **Stripe Webhook Verification**

- [ ] Go to Stripe Dashboard > Developers > Webhooks
- [ ] Find your endpoint
- [ ] Check logs - should see events:
  - [ ] `checkout.session.completed` → Success
  - [ ] `customer.subscription.created` → Success
- [ ] Go to Customers tab
- [ ] Find user by email
- [ ] Verify subscription status: Active

### **Billing Portal**

- [ ] Go to Dashboard
- [ ] Click "Quản lý đăng ký" (or Billing Portal)
- [ ] Redirects to Stripe Billing Portal
- [ ] Can see invoice history
- [ ] Can update payment method
- [ ] Can cancel subscription
- [ ] Cancel subscription
- [ ] Verify warning appears: "Gói sẽ hết hạn vào [date]"

### **Cancel at Period End**

- [ ] Cancel subscription via Billing Portal
- [ ] Go back to Dashboard
- [ ] Verify warning: "⚠️ Gói sẽ hết hạn vào [date]"
- [ ] Still shows "Pro" badge (until period end)
- [ ] Can still create unlimited projects

### **Trial System**

- [ ] Logout
- [ ] Create new account (different email)
- [ ] Go to Pricing page
- [ ] Click "Dùng thử Pro 3 ngày"
- [ ] Should activate trial
- [ ] Dashboard shows "Pro" badge
- [ ] Shows "Trial: còn 3 ngày"
- [ ] Can create unlimited projects

---

## 📊 **MONITORING SETUP (OPTIONAL)**

### **Vercel Analytics**

- [ ] Enable Vercel Analytics (free)
- [ ] Install: `npm install @vercel/analytics`
- [ ] Add `<Analytics />` to layout.tsx
- [ ] Deploy

### **Sentry (Error Tracking)**

- [ ] Create Sentry account
- [ ] Install: `npm install @sentry/nextjs`
- [ ] Run wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Add DSN to Vercel env vars
- [ ] Deploy
- [ ] Test error tracking

### **Google Analytics**

- [ ] Create GA4 property
- [ ] Add tracking code to layout.tsx
- [ ] Verify tracking works

---

## 🔒 **SECURITY AUDIT**

- [ ] No sensitive data in client-side code
- [ ] All secret keys in environment variables
- [ ] RLS policies tested and working
- [ ] Webhook signature verification working
- [ ] No API keys exposed in Git history
- [ ] CORS configured properly
- [ ] Rate limiting considered (optional)

---

## 📝 **POST-LAUNCH TASKS**

### **Immediate (Day 1)**

- [ ] Monitor Vercel logs for errors
- [ ] Monitor Stripe webhook logs
- [ ] Monitor Sentry for errors (if setup)
- [ ] Test all critical user flows
- [ ] Backup production database

### **Week 1**

- [ ] Create social media announcement
- [ ] Email early users (if any)
- [ ] Submit to product directories:
  - [ ] Product Hunt
  - [ ] BetaList
  - [ ] Hacker News (Show HN)
- [ ] Setup status page (optional)

### **Week 2-4**

- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Monitor performance metrics
- [ ] Plan next features (see ROADMAP.md)

---

## 🐛 **ROLLBACK PLAN**

If something goes wrong:

### **Vercel Rollback**

1. Go to Vercel Dashboard > Deployments
2. Find last working deployment
3. Click **⋯** > **"Promote to Production"**
4. Done in 10 seconds!

### **Database Rollback**

⚠️ **ONLY IF ABSOLUTELY NECESSARY**

```bash
supabase db reset
```

_This will delete all data!_

---

## ✅ **COMPLETION**

Once all checkboxes are ticked:

- [ ] All tests passing ✅
- [ ] Production stable for 24 hours ✅
- [ ] No critical bugs ✅
- [ ] User feedback positive ✅

**🎉 CONGRATULATIONS! VibeEditor v1.0.0 is LIVE! 🚀**

---

**Last Updated:** 2025-11-21 by @kiettt23
