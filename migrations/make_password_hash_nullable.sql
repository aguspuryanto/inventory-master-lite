-- Make password_hash nullable since Supabase Auth handles authentication
-- Migration script to fix the NOT NULL constraint on password_hash

-- Make password_hash nullable to work with Supabase Auth
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.password_hash IS 'Password hash (nullable - Supabase Auth handles passwords)';
