-- ============================================
-- FULL FIX CHECKLIST - Run after cleaning data
-- ============================================

-- ✅ Step 1: Verify trigger exists
SELECT 
  trigger_name,
  event_object_schema,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected: 1 row with trigger on auth.users AFTER INSERT

-- ✅ Step 2: Check RLS policies for INSERT
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_subscriptions')
  AND cmd = 'INSERT';

-- Expected: Should see "System can create..." policies

-- ✅ Step 3: Verify signup function defaults to FREE
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user_signup';

-- Expected: Should see subscription_tier = 'free', ai_quota_limit = 5, NO expires_at

-- ✅ Step 4: Check current data (should be EMPTY after clean)
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM user_profiles) as profiles,
  (SELECT COUNT(*) FROM user_subscriptions) as subscriptions;

-- Expected: 0, 0, 0

-- ============================================
-- AFTER RUNNING THIS CHECKLIST:
-- If Step 3 still shows 'pro' → Run migration 20251121000004_change_signup_to_free.sql
-- Then proceed with test flows
-- ============================================
