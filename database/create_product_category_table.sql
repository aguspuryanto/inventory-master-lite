-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);

-- Add RLS (Row Level Security)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for product_categories
CREATE POLICY "Users can view all product categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert product categories" ON product_categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update product categories" ON product_categories
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete product categories" ON product_categories
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert pet care categories
INSERT INTO product_categories (id, name, description) VALUES
  (gen_random_uuid(), 'Pet Odor', 'Produk penghilang bau untuk hewan peliharaan'),
  (gen_random_uuid(), 'Pet Parfum', 'Parfum dan pewangi untuk hewan peliharaan'),
  (gen_random_uuid(), 'Pet Medicine', 'Obat-obatan dan vitamin untuk hewan peliharaan'),
  (gen_random_uuid(), 'Pet Shampoo', 'Shampo dan perawatan kulit hewan peliharaan'),
  (gen_random_uuid(), 'Sanchio Degreaser', 'Produk pembersih dan degreaser Sanchio'),
  (gen_random_uuid(), 'Sanchio Shampo Grooming', 'Shampo grooming dari merek Sanchio')
ON CONFLICT (name) DO NOTHING;

-- Add category_id to products table if not exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL;

-- Create index for products.category_id
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Update existing products to use category names (migration)
UPDATE products 
SET category_id = (
  SELECT pc.id 
  FROM product_categories pc 
  WHERE LOWER(pc.name) = LOWER(products.category)
  LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;
