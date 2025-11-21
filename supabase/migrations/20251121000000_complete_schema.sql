-- ============================================
-- COMPLETE DATABASE SCHEMA - VibeEditor
-- Created: 2025-11-21
-- Purpose: Single comprehensive migration
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE 1: PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE 2: USER_PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro')),
  ai_quota_used INTEGER DEFAULT 0,
  ai_quota_limit INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- TABLE 3: USER_SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Stripe integration columns
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  -- Metadata
  ai_quota_used INTEGER DEFAULT 0,
  ai_quota_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON public.user_subscriptions(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON public.user_subscriptions(subscription_expires_at) WHERE subscription_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON public.user_subscriptions(stripe_subscription_id);

-- RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access" ON public.user_subscriptions;
CREATE POLICY "Service role has full access"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- TABLE 4: USAGE_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON public.usage_logs(timestamp DESC);

-- RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own logs" ON public.usage_logs;
CREATE POLICY "Users can view their own logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own logs" ON public.usage_logs;
CREATE POLICY "Users can create their own logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE 5: PRESET_FILTERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.preset_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  filters_config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_preset_filters_user_id ON public.preset_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_preset_filters_public ON public.preset_filters(is_public) WHERE is_public = TRUE;

-- RLS
ALTER TABLE public.preset_filters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public presets" ON public.preset_filters;
CREATE POLICY "Anyone can view public presets"
  ON public.preset_filters FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own presets" ON public.preset_filters;
CREATE POLICY "Users can create their own presets"
  ON public.preset_filters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own presets" ON public.preset_filters;
CREATE POLICY "Users can update their own presets"
  ON public.preset_filters FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own presets" ON public.preset_filters;
CREATE POLICY "Users can delete their own presets"
  ON public.preset_filters FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FUNCTION: Auto-create user data on signup
-- ============================================

-- Drop old triggers/functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_subscription();

-- Create unified trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- 1. Create user profile with subscription field (legacy)
  INSERT INTO public.user_profiles (
    id,
    user_id,
    subscription,
    ai_quota_used,
    ai_quota_limit,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    'pro', -- Start with Pro trial
    0,
    100,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 2. Create user subscription (main table for subscription logic)
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_tier,
    subscription_expires_at,
    ai_quota_used,
    ai_quota_limit,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'pro', -- 3-day trial
    NOW() + INTERVAL '3 days',
    0,
    100,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block signup
  RAISE WARNING '[handle_new_user_signup] Error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.projects IS 'User photo editing projects';
COMMENT ON TABLE public.user_profiles IS 'User profile data with legacy subscription field';
COMMENT ON TABLE public.user_subscriptions IS 'Main subscription table with tier, expiry, and Stripe data';
COMMENT ON TABLE public.usage_logs IS 'User action logs for analytics';
COMMENT ON TABLE public.preset_filters IS 'User-created filter presets';

COMMENT ON COLUMN public.user_profiles.subscription IS 'Legacy subscription field - use user_subscriptions table instead';
COMMENT ON COLUMN public.user_subscriptions.subscription_tier IS 'Current tier: free or pro';
COMMENT ON COLUMN public.user_subscriptions.subscription_expires_at IS 'Pro expiry date. NULL = no expiry or free tier';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.user_subscriptions.stripe_price_id IS 'Stripe price ID (monthly/yearly)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('projects', 'user_profiles', 'user_subscriptions', 'usage_logs', 'preset_filters');
  
  IF table_count = 5 THEN
    RAISE NOTICE '✅ All 5 tables created successfully';
  ELSE
    RAISE WARNING '⚠️  Only % tables found (expected 5)', table_count;
  END IF;
END $$;

-- Check trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_schema = 'auth'
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE '✅ Trigger on_auth_user_created exists on auth.users';
  ELSE
    RAISE WARNING '⚠️  Trigger not found on auth.users';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VibeEditor Database Schema Created Successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables: projects, user_profiles, user_subscriptions, usage_logs, preset_filters';
  RAISE NOTICE '🔒 RLS: Enabled on all tables';
  RAISE NOTICE '🔔 Trigger: on_auth_user_created → creates profile + subscription';
  RAISE NOTICE '💳 Stripe: Columns added (customer_id, subscription_id, price_id)';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '1. Test signup: Create new account';
  RAISE NOTICE '2. Verify: Check user_profiles and user_subscriptions tables';
  RAISE NOTICE '3. Test Stripe: Go to /pricing and checkout';
  RAISE NOTICE '';
END $$;
