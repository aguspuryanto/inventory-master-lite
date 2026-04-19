-- Add is_owner and is_subscribe fields to users table
-- Migration script for adding subscription and ownership fields

-- Add is_owner field (boolean, default false)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

-- Add is_subscribe field (integer, nullable - 1=starter, 2=business, 3=premium)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_subscribe INTEGER;

-- Update existing users to be owners by default (for backward compatibility)
-- Only set existing users as owners if they don't have subscription set
UPDATE users 
SET is_owner = TRUE 
WHERE is_subscribe IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.is_owner IS 'User role: TRUE for Owner/Administrator, FALSE for regular users';
COMMENT ON COLUMN users.is_subscribe IS 'Subscription package: 1=Starter, 2=Business, 3=Premium, NULL for legacy users';
