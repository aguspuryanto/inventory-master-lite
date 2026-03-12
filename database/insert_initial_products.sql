-- Insert initial products data
-- This will populate the products table with sample data

INSERT INTO products (
    id, 
    code, 
    name, 
    barcode, 
    purchase_price, 
    selling_price, 
    stock, 
    category, 
    created_at, 
    updated_at
) VALUES 
(
    '550e8400-e29b-4b5b-8b8c-1234567890ab', -- crypto.randomUUID() sample
    'PRD001', 
    'Premium Arabica Coffee', 
    '899123456001', 
    45000, 
    65000, 
    45, 
    'Beverage', 
    NOW(), 
    NOW()
),
(
    '550e8400-e29b-4b5b-8b8c-1234567890cd', -- crypto.randomUUID() sample
    'PRD002', 
    'Silk Road Tea', 
    '899123456002', 
    20000, 
    35000, 
    12, 
    'Beverage', 
    NOW(), 
    NOW()
),
(
    '550e8400-e29b-4b5b-8b8c-1234567890ce', -- crypto.randomUUID() sample
    'PRD003', 
    'Organic Honey 500ml', 
    '899123456003', 
    75000, 
    98000, 
    5, 
    'Food', 
    NOW(), 
    NOW()
),
(
    '550e8400-e29b-4b5b-8b8c-1234567890cf', -- crypto.randomUUID() sample
    'PRD004', 
    'Dark Chocolate Bar', 
    '899123456004', 
    15000, 
    25000, 
    120, 
    'Food', 
    NOW(), 
    NOW()
),
(
    '550e8400-e29b-4b5b-8b8c-1234567890d0', -- crypto.randomUUID() sample
    'PRD005', 
    'Artisan Sourdough', 
    '899123456005', 
    18000, 
    32000, 
    2, 
    'Food', 
    NOW(), 
    NOW()
);

-- Optional: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Verify insertion
SELECT COUNT(*) as total_products FROM products;
