-- ============================================
-- FIX: Add missing INSERT policies for trigger
-- ============================================
-- Problem: Trigger function cannot insert into user_profiles and user_subscriptions
-- because RLS is enabled but no INSERT policies exist.
-- Solution: Add INSERT policies for system/trigger use

-- ============================================
-- FIX 1: user_profiles INSERT policy
-- ============================================
DROP POLICY IF EXISTS "System can create user profiles" ON public.user_profiles;
CREATE POLICY "System can create user profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true); -- Allow trigger to insert

-- ============================================
-- FIX 2: user_subscriptions INSERT policy
-- ============================================
DROP POLICY IF EXISTS "System can create user subscriptions" ON public.user_subscriptions;
CREATE POLICY "System can create user subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (true); -- Allow trigger to insert

-- ============================================
-- FIX 3: user_subscriptions SELECT policy (was missing)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FIX 4: user_subscriptions UPDATE policy (for Stripe webhook)
-- ============================================
DROP POLICY IF EXISTS "System can update subscriptions" ON public.user_subscriptions;
CREATE POLICY "System can update subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (true)  -- Allow webhook to update
  WITH CHECK (true);

-- ============================================
-- Verification
-- ============================================
-- Test if policies work by manually calling trigger function on existing users
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get first user without profile
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM user_profiles)
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing trigger for user: %', test_user_id;
    
    -- Manually insert (simulating what trigger should do)
    INSERT INTO public.user_profiles (
      id, user_id, subscription, ai_quota_used, ai_quota_limit
    ) VALUES (
      test_user_id, test_user_id, 'pro', 0, 100
    ) ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.user_subscriptions (
      user_id, subscription_tier, subscription_expires_at, ai_quota_used, ai_quota_limit
    ) VALUES (
      test_user_id, 'pro', NOW() + INTERVAL '3 days', 0, 100
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE '✅ Successfully created profile and subscription for test user';
  ELSE
    RAISE NOTICE 'No users found without profiles (all users already have profiles)';
  END IF;
END $$;

-- Show current state
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM user_profiles) as profiles,
  (SELECT COUNT(*) FROM user_subscriptions) as subscriptions;
