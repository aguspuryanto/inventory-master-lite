-- Supabase SQL Tables for Inventory Master Lite Settings
-- Based on the Settings.tsx component structure

-- 1. Store Settings Table
CREATE TABLE store_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Toko KasirKu',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    tax DECIMAL(5,2) DEFAULT 11.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles Table  
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) DEFAULT 'Admin',
    avatar_url TEXT,
    password_hash VARCHAR(255), -- For authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Staff Management Table
CREATE TABLE staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL CHECK (role IN ('Admin', 'Kasir', 'Manager', 'Super Admin')),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    password_hash VARCHAR(255), -- For staff login
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Payment Methods Table
CREATE TABLE payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'card', 'ewallet', 'bank_transfer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sync Settings Table
CREATE TABLE sync_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auto_sync_enabled BOOLEAN DEFAULT false,
    sync_interval_minutes INTEGER DEFAULT 5,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    backup_enabled BOOLEAN DEFAULT false,
    backup_provider VARCHAR(100), -- 'google_drive', 'dropbox', 'local', etc.
    backup_frequency VARCHAR(50) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Printer Settings Table
CREATE TABLE printer_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    default_printer VARCHAR(255),
    paper_size VARCHAR(50) DEFAULT '58mm' CHECK (paper_size IN ('58mm', '80mm')),
    orientation VARCHAR(50) DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
    auto_print_after_transaction BOOLEAN DEFAULT false,
    print_header_text TEXT,
    print_footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Backup History Table (for sync/backup functionality)
CREATE TABLE backup_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('manual', 'auto', 'scheduled')),
    file_path TEXT,
    file_size BIGINT,
    backup_provider VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'in_progress')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_backup_history_created_at ON backup_history(created_at);

-- RLS (Row Level Security) Policies
-- Enable RLS on all tables
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (adjust according to your auth strategy)
-- Store Settings - only authenticated users can read, admins can write
CREATE POLICY "Store settings read access" ON store_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Store settings write access" ON store_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- User Profiles - users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Staff - only admins can manage staff
CREATE POLICY "Staff read access" ON staff
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff write access" ON staff
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Payment Methods - authenticated users can read, admins can write
CREATE POLICY "Payment methods read access" ON payment_methods
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Payment methods write access" ON payment_methods
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Sync Settings - admins only
CREATE POLICY "Sync settings access" ON sync_settings
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Printer Settings - admins only  
CREATE POLICY "Printer settings access" ON printer_settings
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Backup History - admins only
CREATE POLICY "Backup history access" ON backup_history
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_settings_updated_at BEFORE UPDATE ON sync_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printer_settings_updated_at BEFORE UPDATE ON printer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO store_settings (name, address, phone, email, tax) VALUES
('Toko KasirKu', 'Jl. Contoh No. 123, Jakarta', '021-12345678', 'info@kasirku.com', 11.00);

INSERT INTO user_profiles (name, email, role, avatar_url) VALUES
('Admin Utama', 'admin@kasirku.com', 'Super Admin', '');

INSERT INTO payment_methods (name, type, is_active) VALUES
('Tunai', 'cash', true),
('Kartu Debit', 'card', true),
('Kartu Kredit', 'card', true),
('GoPay', 'ewallet', false),
('OVO', 'ewallet', false),
('Transfer Bank', 'bank_transfer', true);

INSERT INTO sync_settings (auto_sync_enabled, sync_interval_minutes, backup_enabled) VALUES
(false, 5, false);

INSERT INTO printer_settings (default_printer, paper_size, orientation, auto_print_after_transaction) VALUES
('EPON TM-U220', '58mm', 'portrait', false);
