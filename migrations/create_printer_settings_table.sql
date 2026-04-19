-- Create printer_settings table
CREATE TABLE IF NOT EXISTS printer_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    paper_size VARCHAR(10) NOT NULL DEFAULT '58mm' CHECK (paper_size IN ('58mm', '80mm')),
    orientation VARCHAR(10) NOT NULL DEFAULT 'Portrait' CHECK (orientation IN ('Portrait', 'Landscape')),
    auto_print BOOLEAN NOT NULL DEFAULT false,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for store_id
CREATE INDEX IF NOT EXISTS idx_printer_settings_store_id ON printer_settings(store_id);

-- Enable RLS (Row Level Security)
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to access their store's printer settings
CREATE POLICY "Users can view their store printer settings" ON printer_settings
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their store printer settings" ON printer_settings
    FOR ALL USING (
        store_id IN (
            SELECT store_id FROM store_users 
            WHERE user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_printer_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_printer_settings_updated_at
    BEFORE UPDATE ON printer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_printer_settings_updated_at();
