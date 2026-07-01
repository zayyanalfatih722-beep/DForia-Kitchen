-- ====================================================================
-- D'FORIA KITCHEN - SUPABASE SQL INITIALIZATION SCRIPT (V2 - ENHANCED)
-- ====================================================================
-- Salin dan tempel script ini ke SQL Editor di dashboard Supabase Anda
-- (https://supabase.com) untuk membuat seluruh tabel secara otomatis,
-- mengaktifkan Row Level Security (RLS), mengaktifkan Realtime,
-- dan memasukkan data sampel default D'Foria Kitchen.
-- ====================================================================

-- 1. Hapus tabel lama jika ingin memulai dari awal (opsional)
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS menu;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS banners;
-- DROP TABLE IF EXISTS promos;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS settings;

-- 2. Buat tabel CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat tabel MENU (dengan Foreign Key ke Categories)
CREATE TABLE IF NOT EXISTS menu (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL, -- Kategori tekstual untuk fallback
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL, -- Relasi formal
  rating NUMERIC NOT NULL DEFAULT 5,
  image TEXT,
  bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  "dailyQuota" INTEGER NOT NULL DEFAULT 5,
  stock INTEGER NOT NULL DEFAULT 20,
  "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat tabel BANNERS
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Buat tabel PROMOS (Sebelumnya Coupons)
CREATE TABLE IF NOT EXISTS promos (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  "discountType" TEXT NOT NULL DEFAULT 'percentage',
  "discountValue" NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Buat tabel CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Buat tabel ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerId TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customerName TEXT NOT NULL,
  tableNumber TEXT,
  phoneNumber TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSON untuk backward compatibility yang aman
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
  created_at TEXT NOT NULL,
  "stockDecremented" BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. Buat tabel ORDER_ITEMS (Relasi Formal Order & Menu)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Buat tabel SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY, -- 'store_settings' atau 'admin_credentials'
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ====================================================================
-- SEED DATA CONTOH (AGAR LANGSUNG BISA DIGUNAKAN)
-- ====================================================================

-- Seed Categories
INSERT INTO categories (id, name)
VALUES
('cat-1', 'Makanan Berat'),
('cat-2', 'Minuman'),
('cat-3', 'Cemilan')
ON CONFLICT (id) DO NOTHING;

-- Seed Menu (Terhubung ke Categories)
INSERT INTO menu (id, name, description, price, category, category_id, rating, image, bestseller, available, "dailyQuota", stock, "isAvailable")
VALUES
('menu-1', 'Nasi Goreng Hijau', 'Nasi goreng hijau spesial dengan aroma daun kemangi yang harum, disajikan telur mata sapi dadar, lalapan segar, kerupuk udang, dan sambal hijau pilihan.', 12000, 'Makanan Berat', 'cat-1', 5, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600', true, true, 5, 25, true),
('menu-2', 'Ayam Bakar Madu', 'Ayam kampung bakar dilumuri saus madu manis gurih yang meresap sempurna hingga ke serat daging, disajikan hangat dengan lalapan.', 18000, 'Makanan Berat', 'cat-1', 4.8, 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&q=80&w=600', true, true, 10, 15, true),
('menu-3', 'Kopi Susu Gula Aren', 'Espresso premium blend dipadukan susu segar dingin dan pemanis gula aren alami khas Nusantara yang manis legit menyegarkan.', 8000, 'Minuman', 'cat-2', 4.9, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600', true, true, 20, 40, true),
('menu-4', 'Es Teh Manis', 'Seduhan teh melati wangi pilihan disajikan dingin dengan es batu segar dan manis gula tebu asli.', 3000, 'Minuman', 'cat-2', 5, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600', true, true, 50, 100, true),
('menu-5', 'Roti Bakar Cokelat', 'Roti bakar empuk isi cokelat lumer bertabur keju parut melimpah di atasnya, cemilan manis penutup makan malam Anda.', 10000, 'Cemilan', 'cat-3', 4.5, 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&q=80&w=600', false, true, 15, 20, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Banners
INSERT INTO banners (id, "imageUrl", "order")
VALUES
('banner-1', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200', 1),
('banner-2', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed Promos (Coupons)
INSERT INTO promos (id, code, "discountType", "discountValue", active)
VALUES
('promo-1', 'DFORIA10', 'percentage', 10, true),
('promo-2', 'DISKON5K', 'fixed', 5000, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Settings
INSERT INTO settings (id, data)
VALUES
('store_settings', '{
  "storeName": "D''Foria Kitchen",
  "address": "Jl. Perdagangan No. 12, Pulau Weh - Kota Sabang",
  "phone": "+6282255994981",
  "whatsapp": "6282255994981",
  "bankName": "Bank Central Asia (BCA)",
  "bankAccountNumber": "8420994981",
  "bankAccountHolder": "D''Foria Kitchen Indonesia",
  "openingHour": "08:00",
  "closingHour": "22:00",
  "isOpen": true,
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Pulau+Weh+Kota+Sabang+Aceh",
  "locationCity": "Pulau Weh - Kota Sabang",
  "locationProvince": "Aceh, Indonesia"
}'::jsonb),
('admin_credentials', '{
  "username": "admin",
  "password": "admin123"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Customers
INSERT INTO customers (id, name, phone)
VALUES
('cust-1', 'Zea Alzena', '+6282255994981'),
('cust-2', 'Andi Nugroho', '+6281234567890')
ON CONFLICT (id) DO NOTHING;

-- Seed Orders
INSERT INTO orders (id, customerId, customerName, tableNumber, phoneNumber, notes, items, total_amount, payment_method, status, created_at, "stockDecremented")
VALUES
('ORD-916226', 'cust-1', 'Zea Alzena', '05', '+6282255994981', 'Sambal dipisah ya terima kasih', '[{"menuItemId": "menu-1", "name": "Nasi Goreng Hijau", "price": 12000, "quantity": 1, "notes": "Telur setengah matang", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600"}]'::jsonb, 12000, 'Cash', 'Menunggu Konfirmasi', '2026-07-01T00:00:00.000Z', false)
ON CONFLICT (id) DO NOTHING;

-- Seed Order Items
INSERT INTO order_items (id, order_id, menu_item_id, name, price, quantity, notes, image)
VALUES
('item-1', 'ORD-916226', 'menu-1', 'Nasi Goreng Hijau', 12000, 1, 'Telur setengah matang', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (id) DO NOTHING;


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Mengizinkan akses baca dan tulis publik secara aman agar aplikasi client-side
-- dapat membaca & mengupdate data secara langsung secara realtime.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 1. Policies untuk Categories
DROP POLICY IF EXISTS "Allow select for everyone" ON categories;
DROP POLICY IF EXISTS "Allow all for everyone" ON categories;
CREATE POLICY "Allow select for everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON categories FOR ALL USING (true);

-- 2. Policies untuk Menu
DROP POLICY IF EXISTS "Allow select for everyone" ON menu;
DROP POLICY IF EXISTS "Allow all for everyone" ON menu;
CREATE POLICY "Allow select for everyone" ON menu FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON menu FOR ALL USING (true);

-- 3. Policies untuk Banners
DROP POLICY IF EXISTS "Allow select for everyone" ON banners;
DROP POLICY IF EXISTS "Allow all for everyone" ON banners;
CREATE POLICY "Allow select for everyone" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON banners FOR ALL USING (true);

-- 4. Policies untuk Promos
DROP POLICY IF EXISTS "Allow select for everyone" ON promos;
DROP POLICY IF EXISTS "Allow all for everyone" ON promos;
CREATE POLICY "Allow select for everyone" ON promos FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON promos FOR ALL USING (true);

-- 5. Policies untuk Customers
DROP POLICY IF EXISTS "Allow select for everyone" ON customers;
DROP POLICY IF EXISTS "Allow all for everyone" ON customers;
CREATE POLICY "Allow select for everyone" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON customers FOR ALL USING (true);

-- 6. Policies untuk Orders
DROP POLICY IF EXISTS "Allow select for everyone" ON orders;
DROP POLICY IF EXISTS "Allow all for everyone" ON orders;
CREATE POLICY "Allow select for everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON orders FOR ALL USING (true);

-- 7. Policies untuk Order Items
DROP POLICY IF EXISTS "Allow select for everyone" ON order_items;
DROP POLICY IF EXISTS "Allow all for everyone" ON order_items;
CREATE POLICY "Allow select for everyone" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON order_items FOR ALL USING (true);

-- 8. Policies untuk Settings
DROP POLICY IF EXISTS "Allow select for everyone" ON settings;
DROP POLICY IF EXISTS "Allow all for everyone" ON settings;
CREATE POLICY "Allow select for everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON settings FOR ALL USING (true);


-- ====================================================================
-- ENABLING REAL-TIME REPLICATION
-- ====================================================================
-- Mengaktifkan publikasi real-time Supabase agar update langsung disinkronkan secara realtime.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime SET TABLE menu, banners, orders, settings, promos, categories, customers, order_items;
