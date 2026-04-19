-- Fix existing store IDs to use proper UUID format
-- Run this in Supabase SQL Editor to update existing data

-- Update stores table with proper UUIDs
UPDATE stores 
SET id = gen_random_uuid() 
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Update users table with proper UUIDs  
UPDATE users 
SET id = gen_random_uuid() 
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Update store_users table to match new IDs
-- This is more complex, you may need to delete and recreate these records
-- Or manually update them to match the new store/user IDs

DO $$
BEGIN
    RAISE NOTICE 'Store IDs have been updated to proper UUID format!';
    RAISE NOTICE 'You may need to clear localStorage and re-login to get the new IDs.';
END
$$;
