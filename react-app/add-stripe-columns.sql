-- Add Stripe customer ID column to users table
-- Run this in Supabase SQL Editor if the column doesn't exist

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
