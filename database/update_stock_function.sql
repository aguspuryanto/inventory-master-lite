-- Create stock_logs table for audit trail
CREATE TABLE IF NOT EXISTS stock_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  reference_type TEXT NOT NULL, -- 'sale', 'purchase', 'adjustment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for stock_logs
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to manage stock logs" ON stock_logs;

-- Create policy for stock logs
CREATE POLICY "Allow authenticated users to manage stock logs" ON stock_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);

-- Drop existing function first
DROP FUNCTION IF EXISTS update_product_stock(text,integer);

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
  p_product_id TEXT,
  p_quantity_change INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  old_stock INTEGER,
  new_stock INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_stock INTEGER;
  v_new_stock INTEGER;
  v_product_exists BOOLEAN;
BEGIN
  -- Check if product exists
  SELECT EXISTS(SELECT 1 FROM products WHERE id = p_product_id) INTO v_product_exists;
  
  IF NOT v_product_exists THEN
    RETURN QUERY SELECT FALSE, 'Product not found: ' || p_product_id, 0, 0;
    RETURN;
  END IF;
  
  -- Get current stock
  SELECT stock INTO v_old_stock FROM products WHERE id = p_product_id;
  
  -- Update stock by adding/subtracting quantity
  UPDATE products 
  SET 
    stock = stock + p_quantity_change
  WHERE id = p_product_id;
  
  -- Get new stock
  SELECT stock INTO v_new_stock FROM products WHERE id = p_product_id;
  
  -- Ensure stock doesn't go negative
  IF v_new_stock < 0 THEN
    UPDATE products 
    SET 
      stock = 0
    WHERE id = p_product_id;
    v_new_stock := 0;
  END IF;
  
  -- Log the stock change
  INSERT INTO stock_logs (
    id,
    product_id,
    quantity_change,
    reference_type,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_product_id,
    p_quantity_change,
    CASE 
      WHEN p_quantity_change < 0 THEN 'sale'
      WHEN p_quantity_change > 0 THEN 'purchase'
      ELSE 'adjustment'
    END,
    NOW()
  );
  
  -- Return success result
  RETURN QUERY SELECT TRUE, 'Stock updated successfully', v_old_stock, v_new_stock;
END;
$$;
