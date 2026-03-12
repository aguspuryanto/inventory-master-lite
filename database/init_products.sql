-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read products
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert initial products
INSERT INTO products (code, name, barcode, purchase_price, selling_price, stock, category) VALUES
  ('PRD001', 'Premium Arabica Coffee', '899123456001', 45000.00, 65000.00, 45, 'Beverage'),
  ('PRD002', 'Silk Road Tea', '899123456002', 20000.00, 35000.00, 12, 'Beverage'),
  ('PRD003', 'Organic Honey 500ml', '899123456003', 75000.00, 98000.00, 5, 'Food'),
  ('PRD004', 'Dark Chocolate Bar', '899123456004', 15000.00, 25000.00, 120, 'Food'),
  ('PRD005', 'Artisan Sourdough', '899123456005', 18000.00, 32000.00, 2, 'Food')
ON CONFLICT (code) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
