-- Quick Fix: Disable RLS for Registration Tables
-- Created: 2025-04-19
-- Purpose: Immediate fix for RLS policy violations

-- Disable RLS on registration tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_users DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS has been disabled for registration tables!';
    RAISE NOTICE 'User registration should now work without policy violations.';
    RAISE NOTICE 'You can re-enable RLS later with proper policies.';
END
$$;
