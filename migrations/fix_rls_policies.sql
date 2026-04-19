-- Migration: Fix RLS Policies for User Registration
-- Created: 2025-04-19
-- Purpose: Allow user registration and store creation without authentication

-- Drop existing restrictive policies that prevent registration
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that allow user registration
-- Allow anyone to insert (register) new users
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Allow users to view and update their own profile after authentication
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Fix stores table policies to allow store creation during registration
DROP POLICY IF EXISTS "Users can view stores they belong to" ON stores;
DROP POLICY IF EXISTS "Users can update stores they own" ON stores;

-- Allow users to create stores (for registration)
CREATE POLICY "Allow store creation during registration" ON stores
    FOR INSERT WITH CHECK (true);

-- Allow users to view stores they belong to
CREATE POLICY "Users can view stores they belong to" ON stores
    FOR SELECT USING (
        id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

-- Allow users to update stores they own
CREATE POLICY "Users can update stores they own" ON stores
    FOR UPDATE USING (
        id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Fix store_users table policies
DROP POLICY IF EXISTS "Users can view store memberships" ON store_users;

-- Allow users to create store_user relationships (for registration)
CREATE POLICY "Allow store_user creation during registration" ON store_users
    FOR INSERT WITH CHECK (true);

-- Allow users to view store memberships
CREATE POLICY "Users can view store memberships" ON store_users
    FOR SELECT USING (user_id = auth.uid());

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated to allow user registration!';
    RAISE NOTICE 'Users can now register without authentication.';
    RAISE NOTICE 'Store creation is now allowed during registration.';
END
$$;
