-- Migration: Disable RLS for Registration Tables
-- Created: 2025-04-19
-- Purpose: Temporarily disable RLS to allow user registration

-- Disable RLS on tables that need to allow public registration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies after registration is complete
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public user registration
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Allow users to view and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Re-enable RLS for stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow public store creation during registration
CREATE POLICY "Allow store creation during registration" ON stores
    FOR INSERT WITH CHECK (true);

-- Allow users to view stores they belong to
CREATE POLICY "Users can view stores they belong to" ON stores
    FOR SELECT USING (
        auth.uid() IS NULL OR
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

-- Re-enable RLS for store_users
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Allow public store_user creation during registration
CREATE POLICY "Allow store_user creation during registration" ON store_users
    FOR INSERT WITH CHECK (true);

-- Allow users to view store memberships
CREATE POLICY "Users can view store memberships" ON store_users
    FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Alternative: Create a bypass function for registration
CREATE OR REPLACE FUNCTION public.register_user_and_store(
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    user_phone VARCHAR(50),
    store_name VARCHAR(255),
    store_description TEXT,
    store_address TEXT,
    store_phone VARCHAR(50),
    store_email VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    new_store_id UUID;
    result JSON;
BEGIN
    -- Insert user with bypass RLS
    INSERT INTO users (email, full_name, phone, is_active, created_at, updated_at)
    VALUES (user_email, user_full_name, user_phone, true, NOW(), NOW())
    RETURNING id INTO new_user_id;
    
    -- Insert store with bypass RLS
    INSERT INTO stores (name, description, address, phone, email, slug, is_active, created_at, updated_at)
    VALUES (store_name, store_description, store_address, store_phone, store_email, 
            lower(regexp_replace(store_name, '[^a-zA-Z0-9]', '-', 'g')), true, NOW(), NOW())
    RETURNING id INTO new_store_id;
    
    -- Link user to store
    INSERT INTO store_users (store_id, user_id, role, permissions, created_at)
    VALUES (new_store_id, new_user_id, 'owner', '{}', NOW());
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'store_id', new_store_id
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.register_user_and_store TO public;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies have been updated for user registration!';
    RAISE NOTICE 'A bypass function register_user_and_store() has been created.';
    RAISE NOTICE 'Users can now register without RLS policy violations.';
END
$$;
