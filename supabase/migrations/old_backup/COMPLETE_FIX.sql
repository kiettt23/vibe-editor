-- ============================================
-- COMPLETE FIX: User Profiles + Subscriptions + Stripe
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. DROP old conflicting trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CREATE or UPDATE user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro')),
  ai_quota_used INTEGER DEFAULT 0,
  ai_quota_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE or UPDATE user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. ADD Stripe columns (IF NOT EXISTS)
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 5. ADD indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
ON public.user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier 
ON public.user_subscriptions(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at 
ON public.user_subscriptions(subscription_expires_at) 
WHERE subscription_expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer 
ON public.user_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription 
ON public.user_subscriptions(stripe_subscription_id);

-- 6. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. DROP old policies (if exist)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role has full access" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- 8. CREATE RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 9. CREATE RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- 10. CREATE unified trigger function (handles BOTH tables)
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user subscription with 3-day Pro trial
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, subscription_expires_at)
  VALUES (
    NEW.id,
    'pro',
    NOW() + INTERVAL '3 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- 12. BACKFILL existing users (if any users exist without profiles/subscriptions)
INSERT INTO public.user_profiles (id, display_name, avatar_url)
SELECT 
  u.id,
  u.raw_user_meta_data->>'display_name',
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_subscriptions (user_id, subscription_tier, subscription_expires_at)
SELECT 
  u.id,
  'pro',
  NOW() + INTERVAL '3 days'
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 13. ADD comments
COMMENT ON TABLE public.user_subscriptions IS 'User subscription data with tier, expiry, and Stripe information';
COMMENT ON COLUMN public.user_subscriptions.subscription_tier IS 'Subscription tier: free or pro';
COMMENT ON COLUMN public.user_subscriptions.subscription_expires_at IS 'Pro subscription expiry date. NULL means no expiry or free tier';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for management';
COMMENT ON COLUMN public.user_subscriptions.stripe_price_id IS 'Stripe price ID (monthly/yearly)';

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check all users have profiles
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  s.user_id as subscription_user_id,
  s.subscription_tier,
  s.subscription_expires_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id;

-- Check Stripe columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
AND column_name LIKE 'stripe_%';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '✅ Trigger created: on_auth_user_created';
  RAISE NOTICE '✅ Tables: user_profiles, user_subscriptions';
  RAISE NOTICE '✅ Stripe columns added';
  RAISE NOTICE '✅ Existing users backfilled';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Test signup: Create new account and verify both tables get rows';
  RAISE NOTICE '2. Test Stripe: Go to /pricing and complete checkout';
  RAISE NOTICE '3. Verify webhook updates: Check Stripe columns after payment';
END $$;
