-- Migration: Multi-Store SaaS Schema (Safe Version)
-- Created: 2025-04-18
-- Purpose: Transform single-store app to multi-store SaaS platform
-- This version handles existing table structures safely

-- PostgreSQL version for Supabase

-- 1. Create new tables first (these don't depend on existing tables)
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

CREATE TABLE IF NOT EXISTS store_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'owner',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);

-- 2. Check if store_settings table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_settings') THEN
        CREATE TABLE store_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL DEFAULT 'InvMaster POS',
            address TEXT DEFAULT 'Gedung Sudirman Lantai 4, Jakarta',
            phone VARCHAR(50) DEFAULT '(021) 12345678',
            email VARCHAR(255) DEFAULT 'admin@example.com',
            logo_url TEXT,
            tax_number VARCHAR(50),
            footer_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- 3. Add store_id columns to existing tables (safe approach)
DO $$
BEGIN
    -- Add store_id to products table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'store_id') THEN
        ALTER TABLE products ADD COLUMN store_id UUID;
    END IF;
    
    -- Add store_id to transactions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'store_id') THEN
        ALTER TABLE transactions ADD COLUMN store_id UUID;
    END IF;
    
    -- Add store_id to store_settings table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_id') THEN
        ALTER TABLE store_settings ADD COLUMN store_id UUID;
    END IF;
END
$$;

-- 4. Create default store for existing data
INSERT INTO stores (name, slug, description, address, phone, email)
VALUES (
    'Default Store',
    'default-store',
    'Default store for existing data',
    'Gedung Sudirman Lantai 4, Jakarta',
    '(021) 12345678',
    'admin@example.com'
) ON CONFLICT (slug) DO NOTHING;

-- 5. Update existing data to use default store
UPDATE products 
SET store_id = (SELECT id FROM stores WHERE slug = 'default-store' LIMIT 1) 
WHERE store_id IS NULL;

UPDATE transactions 
SET store_id = (SELECT id FROM stores WHERE slug = 'default-store' LIMIT 1) 
WHERE store_id IS NULL;

-- Handle store_settings - create default record if it doesn't exist
INSERT INTO store_settings (name, address, phone, email, store_id)
SELECT 
    'InvMaster POS',
    'Gedung Sudirman Lantai 4, Jakarta',
    '(021) 12345678',
    'admin@example.com',
    (SELECT id FROM stores WHERE slug = 'default-store' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE store_id IS NOT NULL);

UPDATE store_settings 
SET store_id = (SELECT id FROM stores WHERE slug = 'default-store' LIMIT 1) 
WHERE store_id IS NULL;

-- 6. Add foreign key constraints (now that data is populated)
DO $$
BEGIN
    -- Add foreign key for products.store_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'products' AND constraint_name = 'fk_products_store_id') THEN
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_store_id 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for transactions.store_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'transactions' AND constraint_name = 'fk_transactions_store_id') THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_store_id 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for store_settings.store_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'store_settings' AND constraint_name = 'fk_store_settings_store_id') THEN
        ALTER TABLE store_settings 
        ADD CONSTRAINT fk_store_settings_store_id 
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- 7. Make store_id NOT NULL after data migration and constraints are set
DO $$
BEGIN
    -- Make store_id NOT NULL in products
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'store_id') THEN
        ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
    END IF;
    
    -- Make store_id NOT NULL in transactions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'store_id') THEN
        ALTER TABLE transactions ALTER COLUMN store_id SET NOT NULL;
    END IF;
    
    -- Make store_id NOT NULL in store_settings
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_id') THEN
        ALTER TABLE store_settings ALTER COLUMN store_id SET NOT NULL;
    END IF;
END
$$;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_store_users_store_id ON store_users(store_id);
CREATE INDEX IF NOT EXISTS idx_store_users_user_id ON store_users(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Multi-store schema migration completed successfully!';
    RAISE NOTICE 'Default store created with slug: default-store';
    RAISE NOTICE 'Existing data has been migrated to the default store.';
END
$$;
