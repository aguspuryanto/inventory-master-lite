-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  main_category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to view transactions" ON transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transactions" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update transactions" ON transactions
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete transactions" ON transactions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_main_category ON transactions(main_category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO transactions (id, type, main_category, sub_category, amount, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'IN', 'Stok Awal', 'Produk Baru', 45, 'Stok awal Premium Arabica Coffee'),
  ('550e8400-e29b-41d4-a716-446655440001', 'IN', 'Stok Awal', 'Produk Baru', 12, 'Stok awal Silk Road Tea'),
  ('550e8400-e29b-41d4-a716-446655440002', 'IN', 'Stok Awal', 'Produk Baru', 5, 'Stok awal Organic Honey 500ml'),
  ('550e8400-e29b-41d4-a716-446655440003', 'IN', 'Stok Awal', 'Produk Baru', 120, 'Stok awal Dark Chocolate Bar'),
  ('550e8400-e29b-41d4-a716-446655440004', 'IN', 'Stok Awal', 'Produk Baru', 2, 'Stok awal Artisan Sourdough')
ON CONFLICT (id) DO NOTHING;

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
