-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Stores can be managed by owners" ON stores;
DROP POLICY IF EXISTS "Store users can be managed" ON store_users;
DROP POLICY IF EXISTS "Products can be managed by store users" ON products;
DROP POLICY IF EXISTS "Transactions can be managed by store users" ON transactions;
DROP POLICY IF EXISTS "Transaction items can be managed by store users" ON transaction_items;
DROP POLICY IF EXISTS "Store settings can be managed by store users" ON store_settings;
DROP POLICY IF EXISTS "Printer settings can be managed by store users" ON printer_settings;

-- Create policies for users table
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for stores table
CREATE POLICY "Stores can be viewed by all" ON stores
  FOR SELECT
  USING (true);

CREATE POLICY "Stores can be inserted by anyone" ON stores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Stores can be updated by owners" ON stores
  FOR UPDATE
  USING (
    id IN (
      SELECT store_id FROM store_users 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Create policies for store_users table
CREATE POLICY "Store users can be managed" ON store_users
  FOR ALL
  USING (true);

-- Create policies for products table
CREATE POLICY "Products can be viewed by all" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Products can be managed by store users" ON products
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Products can be updated by store users" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Products can be deleted by store users" ON products
  FOR DELETE USING (true);

-- Create policies for transactions table
CREATE POLICY "Transactions can be viewed by all" ON transactions
  FOR SELECT
  USING (true);

CREATE POLICY "Transactions can be managed by store users" ON transactions
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Transactions can be updated by store users" ON transactions
  FOR UPDATE USING (true);

-- Create policies for transaction_items table
CREATE POLICY "Transaction items can be managed by store users" ON transaction_items
  FOR ALL
  USING (true);

-- Create policies for store_settings table
CREATE POLICY "Store settings can be managed by store users" ON store_settings
  FOR ALL
  USING (true);

-- Create policies for printer_settings table
CREATE POLICY "Printer settings can be managed by store users" ON printer_settings
  FOR ALL
  USING (true);
