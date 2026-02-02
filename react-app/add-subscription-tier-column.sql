-- Add subscription_tier column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'professional' CHECK (subscription_tier IN ('basic', 'professional'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(subscription_tier);

-- Update existing subscriptions to have 'professional' tier (default)
UPDATE subscriptions 
SET subscription_tier = 'professional' 
WHERE subscription_tier IS NULL;
