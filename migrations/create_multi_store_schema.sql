-- Migration: Multi-Store SaaS Schema
-- Created: 2025-04-18
-- Purpose: Transform single-store app to multi-store SaaS platform

-- PostgreSQL version for Supabase

-- 1. Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create store_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS store_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'owner', -- owner, admin, staff
    permissions JSONB DEFAULT '{}', -- Store custom permissions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);

-- 4. Add store_id to existing tables
-- Add to products table
ALTER TABLE products 
ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Add to transactions table
ALTER TABLE transactions 
ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Add to store_settings table (rename and modify)
ALTER TABLE store_settings 
ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_users_store_id ON store_users(store_id);
CREATE INDEX IF NOT EXISTS idx_store_users_user_id ON store_users(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 6. Create default store for existing data
INSERT INTO stores (id, name, slug, description, address, phone, email)
VALUES (
    gen_random_uuid(),
    'Default Store',
    'default-store',
    'Default store for existing data',
    'Gedung Sudirman Lantai 4, Jakarta',
    '(021) 12345678',
    'admin@example.com'
) ON CONFLICT (slug) DO NOTHING;

-- 7. Update existing data to use default store
-- This assumes the default store was inserted first and has the lowest id
UPDATE products 
SET store_id = (SELECT id FROM stores ORDER BY created_at ASC LIMIT 1) 
WHERE store_id IS NULL;

UPDATE transactions 
SET store_id = (SELECT id FROM stores ORDER BY created_at ASC LIMIT 1) 
WHERE store_id IS NULL;

UPDATE store_settings 
SET store_id = (SELECT id FROM stores ORDER BY created_at ASC LIMIT 1) 
WHERE store_id IS NULL;

-- 8. Make store_id NOT NULL after data migration
ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE store_settings ALTER COLUMN store_id SET NOT NULL;

-- 9. Add comments for documentation
COMMENT ON TABLE stores IS 'Store information for multi-tenant SaaS platform';
COMMENT ON TABLE users IS 'User accounts for UMKM owners and staff';
COMMENT ON TABLE store_users IS 'Many-to-many relationship between stores and users with roles';
COMMENT ON COLUMN products.store_id IS 'Foreign key to stores table for multi-tenant isolation';
COMMENT ON COLUMN transactions.store_id IS 'Foreign key to stores table for multi-tenant isolation';
COMMENT ON COLUMN store_settings.store_id IS 'Foreign key to stores table for multi-tenant isolation';
COMMENT ON COLUMN store_users.role IS 'User role within the store (owner, admin, staff)';
COMMENT ON COLUMN store_users.permissions IS 'JSON object for custom permissions';

-- 10. Create RLS (Row Level Security) policies for Supabase
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Store policies
CREATE POLICY "Users can view stores they belong to" ON stores
    FOR SELECT USING (
        id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update stores they own" ON stores
    FOR UPDATE USING (
        id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- User policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Store users policies
CREATE POLICY "Users can view store memberships" ON store_users
    FOR SELECT USING (user_id = auth.uid());

-- Product policies
CREATE POLICY "Users can view products from their stores" ON products
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage products from their stores" ON products
    FOR ALL USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Transaction policies
CREATE POLICY "Users can view transactions from their stores" ON transactions
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create transactions in their stores" ON transactions
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'staff')
        )
    );

-- Store settings policies
CREATE POLICY "Users can view settings from their stores" ON store_settings
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update settings from their stores" ON store_settings
    FOR UPDATE USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- SQLite version (for local development)
-- Note: SQLite doesn't support UUID, JSONB, or RLS policies
-- Use TEXT for UUID, TEXT for JSONB, and omit RLS policies

-- 1. Create stores table (SQLite)
-- CREATE TABLE IF NOT EXISTS stores (
--     id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
--     name TEXT NOT NULL,
--     slug TEXT UNIQUE NOT NULL,
--     description TEXT,
--     address TEXT,
--     phone TEXT,
--     email TEXT,
--     logo_url TEXT,
--     is_active INTEGER DEFAULT 1,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- 2. Create users table (SQLite)
-- CREATE TABLE IF NOT EXISTS users (
--     id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
--     email TEXT UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL,
--     full_name TEXT,
--     phone TEXT,
--     is_active INTEGER DEFAULT 1,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- 3. Create store_users table (SQLite)
-- CREATE TABLE IF NOT EXISTS store_users (
--     id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
--     store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
--     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     role TEXT NOT NULL DEFAULT 'owner',
--     permissions TEXT DEFAULT '{}',
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(store_id, user_id)
-- );

-- 4. Add store_id to existing tables (SQLite)
-- ALTER TABLE products ADD COLUMN store_id TEXT REFERENCES stores(id) ON DELETE CASCADE;
-- ALTER TABLE transactions ADD COLUMN store_id TEXT REFERENCES stores(id) ON DELETE CASCADE;
-- ALTER TABLE store_settings ADD COLUMN store_id TEXT REFERENCES stores(id) ON DELETE CASCADE;
