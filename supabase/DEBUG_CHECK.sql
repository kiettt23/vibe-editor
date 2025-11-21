-- ============================================
-- DEBUG SCRIPT: Check Database State
-- ============================================

-- 1. Check if tables exist
SELECT 'TABLES CHECK:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_subscriptions', 'projects', 'usage_logs', 'preset_filters');

-- 2. Check if trigger exists
SELECT 'TRIGGER CHECK:' as check_type;
SELECT 
  trigger_name, 
  event_object_schema,
  event_object_table, 
  action_statement,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if function exists
SELECT 'FUNCTION CHECK:' as check_type;
SELECT 
  proname as function_name,
  pronargs as num_args
FROM pg_proc
WHERE proname = 'handle_new_user_signup';

-- 4. Check auth.users (should have records)
SELECT 'AUTH USERS CHECK:' as check_type;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Check user_profiles (might be empty - THIS IS THE PROBLEM)
SELECT 'USER PROFILES CHECK:' as check_type;
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT * FROM user_profiles LIMIT 3;

-- 6. Check user_subscriptions (might be empty - THIS IS THE PROBLEM)
SELECT 'USER SUBSCRIPTIONS CHECK:' as check_type;
SELECT COUNT(*) as total_subscriptions FROM user_subscriptions;
SELECT * FROM user_subscriptions LIMIT 3;

-- 7. Compare counts (CRITICAL CHECK)
SELECT 'COUNT COMPARISON:' as check_type;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM user_profiles) as profiles,
  (SELECT COUNT(*) FROM user_subscriptions) as subscriptions;

-- 8. Get function definition
SELECT 'FUNCTION DEFINITION:' as check_type;
SELECT pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'handle_new_user_signup';

-- NOTE: If trigger exists with correct schema (auth.users) but still not firing,
-- the function might have a logic error. Check the definition above.
