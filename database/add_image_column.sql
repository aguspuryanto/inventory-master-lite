-- Add image_url column to products table
ALTER TABLE products ADD COLUMN image_url TEXT;

-- Update existing products to have empty image_url
UPDATE products SET image_url = '' WHERE image_url IS NULL;

-- Create index for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'image_url';
