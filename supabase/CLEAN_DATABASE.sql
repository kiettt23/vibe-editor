-- ============================================
-- CLEAN ALL DATA - FRESH START
-- ⚠️  WARNING: Deletes ALL user data and test accounts
-- ============================================

-- Step 1: Delete all rows from tables (keeps schema)
DELETE FROM public.preset_filters;
DELETE FROM public.usage_logs;
DELETE FROM public.projects;
DELETE FROM public.user_subscriptions;
DELETE FROM public.user_profiles;

-- Step 2: Delete all auth users (CASCADE will clean related data)
-- ⚠️  This removes ALL accounts including OAuth
DELETE FROM auth.users;

-- Step 3: Reset sequences if any
-- (Add ALTER SEQUENCE ... RESTART WITH 1 if you have auto-increment columns)

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All data cleaned!';
  RAISE NOTICE 'Tables: projects, user_subscriptions, user_profiles, auth.users';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run migration: 20251121000004_change_signup_to_free.sql';
  RAISE NOTICE '2. Test email signup';
  RAISE NOTICE '3. Test OAuth Google signup';
  RAISE NOTICE '4. Test Stripe checkout + cancel flow';
END $$;
