-- Inject Demo User and Store Data
-- Run this in Supabase SQL Editor to create demo user with proper UUIDs

-- Insert demo user
INSERT INTO users (
  id, 
  email, 
  password_hash,
  full_name, 
  phone, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  extensions.uuid_generate_v4(),
  'admin@example.com',
  'admin1234',
  'Admin Utama',
  '+62812345678',
  true,
  NOW(),
  NOW()
);

-- Insert demo store
INSERT INTO stores (
  id,
  name,
  slug,
  description,
  address,
  phone,
  email,
  is_active,
  created_at,
  updated_at
) VALUES (
  extensions.uuid_generate_v4(),
  'Toko Demo',
  'toko-demo',
  'Toko demo untuk testing',
  'Jl. Demo No. 123, Jakarta',
  '(021) 12345678',
  'admin@example.com',
  true,
  NOW(),
  NOW()
);

-- Link user to store (get the IDs from the inserts above)
INSERT INTO store_users (
  id,
  store_id,
  user_id,
  role,
  permissions,
  created_at
) 
SELECT 
  extensions.uuid_generate_v4(),
  s.id as store_id,
  u.id as user_id,
  'owner' as role,
  '{}' as permissions,
  NOW()
FROM users u, stores s 
WHERE u.email = 'admin@example.com' AND s.name = 'Toko Demo';

-- Insert store settings
INSERT INTO store_settings (
  id,
  store_id,
  name,
  address,
  phone,
  email,
  created_at,
  updated_at
)
SELECT 
  extensions.uuid_generate_v4(),
  s.id as store_id,
  s.name,
  s.address,
  s.phone,
  s.email,
  NOW(),
  NOW()
FROM stores s 
WHERE s.name = 'Toko Demo';

DO $$
BEGIN
    RAISE NOTICE 'Demo user and store data has been inserted!';
    RAISE NOTICE 'You can now login with: admin@example.com / admin1234';
    RAISE NOTICE 'All data uses proper UUID format.';
END
$$;
