-- ============================================
-- QUICK CLEAN DEPLOYMENT
-- Run this if you want to start fresh (⚠️  Deletes all data!)
-- ============================================

-- 1. Drop all tables
DROP TABLE IF EXISTS public.preset_filters CASCADE;
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- 2. Drop all triggers/functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All old schema dropped. Ready for fresh migration.';
  RAISE NOTICE 'Next: Run supabase/migrations/20251121000000_complete_schema.sql';
END $$;
