-- ============================================
-- ADD: cancel_at_period_end tracking
-- ============================================
-- Purpose: Track if user has scheduled cancellation
-- This helps UI display "Your subscription will end on [date]" warning

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cancelling 
ON user_subscriptions(cancel_at_period_end) 
WHERE cancel_at_period_end = TRUE;

-- Comment
COMMENT ON COLUMN user_subscriptions.cancel_at_period_end IS 
'TRUE if user has cancelled but subscription is still active until period end. 
Set to FALSE when subscription actually ends or is renewed.';

-- Verify
SELECT 
  'ADDED COLUMN:' as step,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' 
AND column_name = 'cancel_at_period_end';
