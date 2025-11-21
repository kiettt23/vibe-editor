-- ============================================
-- SYNC user_profiles.subscription with user_subscriptions.subscription_tier
-- ============================================
-- Problem: Two tables have subscription fields but they're not synced
-- This migration ensures they always match

-- Update all existing records to sync
UPDATE user_profiles p
SET 
  subscription = s.subscription_tier,
  ai_quota_limit = s.ai_quota_limit,
  updated_at = NOW()
FROM user_subscriptions s
WHERE p.user_id = s.user_id
  AND (p.subscription != s.subscription_tier OR p.ai_quota_limit != s.ai_quota_limit);

-- Verify sync
SELECT 
  'VERIFICATION:' as step,
  COUNT(*) as total_mismatched
FROM user_profiles p
JOIN user_subscriptions s ON p.user_id = s.user_id
WHERE p.subscription != s.subscription_tier;

-- Expected: total_mismatched = 0
