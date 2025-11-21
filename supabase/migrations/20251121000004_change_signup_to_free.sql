-- ============================================
-- FIX: Change default signup tier to Free
-- ============================================
-- Change from Pro trial to Free by default
-- Users can upgrade to Pro via /pricing

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
    'free', -- Start with Free tier
    0,
    5, -- Free quota
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
    cancel_at_period_end,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'free', -- Free tier, no expiry
    NULL, -- No expiration for free tier
    0,
    5, -- Free quota
    FALSE,
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

-- Verify function updated
SELECT 'Function updated successfully' as status;
