-- Add Stripe-related columns to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer 
ON user_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription 
ON user_subscriptions(stripe_subscription_id);

COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for management';
COMMENT ON COLUMN user_subscriptions.stripe_price_id IS 'Stripe price ID (monthly/yearly)';
