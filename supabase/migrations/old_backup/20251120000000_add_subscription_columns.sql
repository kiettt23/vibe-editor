-- Create user_subscriptions table
-- Stores subscription data separately from auth.users

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one subscription per user
  UNIQUE(user_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
ON public.user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier 
ON public.user_subscriptions(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at 
ON public.user_subscriptions(subscription_expires_at) 
WHERE subscription_expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read/update their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for server actions)
CREATE POLICY "Service role has full access"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile (from initial migration)
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create user subscription with 3-day trial
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, subscription_expires_at)
  VALUES (
    NEW.id,
    'pro',
    NOW() + INTERVAL '3 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile + subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Comments for documentation
COMMENT ON TABLE public.user_subscriptions IS 'User subscription data with tier and expiry information';
COMMENT ON COLUMN public.user_subscriptions.subscription_tier IS 'Subscription tier: free or pro';
COMMENT ON COLUMN public.user_subscriptions.subscription_expires_at IS 'Pro subscription expiry date. NULL means no expiry or free tier';
