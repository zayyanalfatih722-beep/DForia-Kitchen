/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Lock,
  User,
  Globe,
  Database,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  Tag,
  Layers
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminSettings() {
  const navigate = useNavigate();

  // Shared entity state
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Settings states
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    storeName: '',
    address: '',
    phone: '',
    whatsapp: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    openingHour: '08:00',
    closingHour: '22:00',
    isOpen: true,
    mapsUrl: '',
    locationCity: '',
    locationProvince: ''
  });

  // Username states
  const [usernameForm, setUsernameForm] = useState({
    newUsername: dbService.getAdminUsername()
  });
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password states
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Feedback states
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Supabase connection states
  const initialSupaConfig = (dbService as any).getSupabaseConfig ? (dbService as any).getSupabaseConfig() : { url: '', anonKey: '', isEnv: false };
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(initialSupaConfig.url);
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(initialSupaConfig.anonKey);
  const [supabaseSetupLoading, setSupabaseSetupLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Supabase Table Verification States
  const [copiedSql, setCopiedSql] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<{[key: string]: 'untested' | 'success' | 'failed'}>({
    categories: 'untested',
    menu: 'untested',
    banners: 'untested',
    promos: 'untested',
    orders: 'untested',
    order_items: 'untested',
    customers: 'untested',
    settings: 'untested'
  });
  const [verificationStatus, setVerificationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCopySql = () => {
    const sqlText = `-- ====================================================================
-- D'FORIA KITCHEN - SUPABASE SQL INITIALIZATION SCRIPT (V2 - ENHANCED)
-- ====================================================================
-- Salin dan tempel script ini ke SQL Editor di dashboard Supabase Anda
-- (https://supabase.com) untuk membuat seluruh tabel secara otomatis,
-- mengaktifkan Row Level Security (RLS), mengaktifkan Realtime,
-- dan memasukkan data sampel default D'Foria Kitchen.
-- ====================================================================

-- 2. Buat tabel CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat tabel MENU
CREATE TABLE IF NOT EXISTS menu (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
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
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Menunggu Konfirmasi',
  created_at TEXT NOT NULL,
  "stockDecremented" BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. Buat tabel ORDER_ITEMS
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
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Seed Categories
INSERT INTO categories (id, name)
VALUES
('cat-1', 'Makanan Berat'),
('cat-2', 'Minuman'),
('cat-3', 'Cemilan')
ON CONFLICT (id) DO NOTHING;

-- Seed Menu
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

-- Seed Promos
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

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for everyone" ON categories;
DROP POLICY IF EXISTS "Allow all for everyone" ON categories;
CREATE POLICY "Allow select for everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON menu;
DROP POLICY IF EXISTS "Allow all for everyone" ON menu;
CREATE POLICY "Allow select for everyone" ON menu FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON menu FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON banners;
DROP POLICY IF EXISTS "Allow all for everyone" ON banners;
CREATE POLICY "Allow select for everyone" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON banners FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON promos;
DROP POLICY IF EXISTS "Allow all for everyone" ON promos;
CREATE POLICY "Allow select for everyone" ON promos FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON promos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON customers;
DROP POLICY IF EXISTS "Allow all for everyone" ON customers;
CREATE POLICY "Allow select for everyone" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON orders;
DROP POLICY IF EXISTS "Allow all for everyone" ON orders;
CREATE POLICY "Allow select for everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON order_items;
DROP POLICY IF EXISTS "Allow all for everyone" ON order_items;
CREATE POLICY "Allow select for everyone" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON order_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select for everyone" ON settings;
DROP POLICY IF EXISTS "Allow all for everyone" ON settings;
CREATE POLICY "Allow select for everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow all for everyone" ON settings FOR ALL USING (true);

-- REAL-TIME REPLICATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime SET TABLE menu, banners, orders, settings, promos, categories, customers, order_items;

-- ==========================================
-- SETUP BUCKET DAN KEBIJAKAN KEAMANAN (RLS)
-- UNTUK STORAGE menu-photos
-- ==========================================

-- Pastikan bucket 'menu-photos' telah terdaftar di database storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Aktifkan RLS untuk storage.objects jika belum
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke storage bucket untuk anonymous/semua pengguna
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'menu-photos');

DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
CREATE POLICY "Allow public select" ON storage.objects 
FOR SELECT USING (bucket_id = 'menu-photos');

DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
CREATE POLICY "Allow public update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'menu-photos');

DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'menu-photos');
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleVerifyTables = async () => {
    setVerificationLoading(true);
    setVerificationStatus(null);
    const tables = ['categories', 'menu', 'banners', 'promos', 'orders', 'order_items', 'customers', 'settings'];
    const newStatuses = { ...tableStatus };
    
    if (!(dbService as any).isCloudMode()) {
      setVerificationStatus({
        type: 'error',
        message: 'Mohon hubungkan Supabase terlebih dahulu sebelum memverifikasi tabel.'
      });
      setVerificationLoading(false);
      return;
    }

    const client = (dbService as any).getSupabaseClient ? (dbService as any).getSupabaseClient() : null;
    if (!client) {
      setVerificationStatus({
        type: 'error',
        message: 'Client Supabase belum siap atau belum dikonfigurasi.'
      });
      setVerificationLoading(false);
      return;
    }

    for (const t of tables) {
      try {
        const { error } = await client.from(t).select('*').limit(1);
        if (error) {
          if (error.code === 'PGRST116') {
            newStatuses[t] = 'success';
          } else {
            console.warn(`Verifikasi tabel ${t} gagal:`, error);
            newStatuses[t] = 'failed';
          }
        } else {
          newStatuses[t] = 'success';
        }
      } catch (err) {
        newStatuses[t] = 'failed';
      }
    }
    
    setTableStatus(newStatuses);
    setVerificationLoading(false);
    
    const failedCount = Object.values(newStatuses).filter(s => s === 'failed').length;
    if (failedCount === 0) {
      setVerificationStatus({
        type: 'success',
        message: 'Luar biasa! Semua 8 tabel D\'Foria Kitchen berhasil terverifikasi & aktif di database Supabase Anda!'
      });
    } else {
      setVerificationStatus({
        type: 'error',
        message: `Terdapat ${failedCount} tabel yang belum terbuat atau gagal diakses. Pastikan Anda sudah menjalankan script SQL di Supabase SQL Editor.`
      });
    }
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseStatus(null);
    setSupabaseSetupLoading(true);
    try {
      if ((dbService as any).saveSupabaseConfig) {
        await (dbService as any).saveSupabaseConfig(supabaseUrlInput, supabaseAnonKeyInput);
        if (supabaseUrlInput.trim() === '' && supabaseAnonKeyInput.trim() === '') {
          setSupabaseStatus({ type: 'success', message: 'Koneksi Supabase dinonaktifkan. Kembali ke Sandbox Lokal...' });
        } else {
          setSupabaseStatus({ type: 'success', message: 'Koneksi Supabase Berhasil! Memuat ulang halaman untuk mengaktifkan...' });
        }
      } else {
        throw new Error('Metode saveSupabaseConfig tidak ditemukan.');
      }
    } catch (err: any) {
      console.error(err);
      setSupabaseStatus({ 
        type: 'error', 
        message: err.message || 'Koneksi gagal. Pastikan URL dan Anon Key Supabase Anda benar, serta tabel sudah di-setup.'
      });
    } finally {
      setSupabaseSetupLoading(false);
    }
  };

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedSettings = await dbService.getSettings();
      setSettings(fetchedSettings);
      setSettingsForm({
        storeName: fetchedSettings.storeName || '',
        address: fetchedSettings.address || '',
        phone: fetchedSettings.phone || '',
        whatsapp: fetchedSettings.whatsapp || '',
        bankName: fetchedSettings.bankName || '',
        bankAccountNumber: fetchedSettings.bankAccountNumber || '',
        bankAccountHolder: fetchedSettings.bankAccountHolder || '',
        openingHour: fetchedSettings.openingHour || '08:00',
        closingHour: fetchedSettings.closingHour || '22:00',
        isOpen: fetchedSettings.isOpen !== undefined ? fetchedSettings.isOpen : true,
        mapsUrl: fetchedSettings.mapsUrl || '',
        locationCity: fetchedSettings.locationCity || '',
        locationProvince: fetchedSettings.locationProvince || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveLoading(true);
    try {
      await dbService.saveSettings(settingsForm);
      setSettings(settingsForm);
      setSaveStatus({ type: 'success', message: "Profil D'Foria Kitchen berhasil diperbarui!" });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setSaveStatus({ 
        type: 'error', 
        message: "Gagal menyimpan pengaturan: " + (err instanceof Error ? err.message : String(err)) 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordForm.newPassword) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi baru tidak boleh kosong.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi baru minimal harus 6 karakter.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await dbService.changeAdminPassword(passwordForm.newPassword);
      setPasswordStatus({ type: 'success', message: 'Kata sandi admin berhasil diperbarui!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setPasswordStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setPasswordStatus({ 
        type: 'error', 
        message: "Gagal mengganti kata sandi: " + (err instanceof Error ? err.message : String(err)) 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameStatus(null);

    const trimmedUsername = usernameForm.newUsername.trim();
    if (!trimmedUsername) {
      setUsernameStatus({ type: 'error', message: 'Username baru tidak boleh kosong.' });
      return;
    }

    if (trimmedUsername.length < 3) {
      setUsernameStatus({ type: 'error', message: 'Username baru minimal harus 3 karakter.' });
      return;
    }

    setUsernameLoading(true);
    try {
      await dbService.changeAdminUsername(trimmedUsername);
      setUsernameStatus({ type: 'success', message: 'Username admin berhasil diperbarui!' });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setUsernameStatus(null), 5000);
    } catch (err: any) {
      console.error(err);
      setUsernameStatus({ 
        type: 'error', 
        message: "Gagal mengganti username: " + (err?.message || "Terjadi kesalahan") 
      });
    } finally {
      setUsernameLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-auto bg-cream pb-12">
      {/* Top Admin Header */}
      <AdminHeader />

      {/* Main Body */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-cream-dark/30 shadow-soft"
          >
            <span>← Kembali ke Dashboard</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-serif italic text-sm text-gray-400">Menghubungkan ke pusat data D'Foria...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif font-bold text-2xl text-gray-800">Pengaturan D'Foria Kitchen</h2>
              <p className="text-xs text-gray-400 mt-1">Ubah nama, alamat lengkap, nomor kontak, serta kata sandi panel kontrol restoran Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Store Profile Settings (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50">Profil Toko / Cabang</h3>
                  
                  {saveStatus && (
                    <div className={`mb-5 p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                      saveStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {saveStatus.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="flex-1 font-medium">{saveStatus.message}</div>
                      <button 
                        onClick={() => setSaveStatus(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4.5 text-xs text-gray-600">
                    {/* Manual Store Open/Close Toggle */}
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-serif font-bold text-xs text-amber-950 uppercase tracking-wide">Status Manual Toko</h3>
                        <p className="text-[10px] text-amber-800/80 mt-0.5 font-medium">Buka atau tutup toko secara paksa (override) untuk pelanggan.</p>
                      </div>
                      <button
                        id="btn-toggle-store-status"
                        type="button"
                        onClick={() => setSettingsForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                        className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer border ${
                          settingsForm.isOpen
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-105 active:scale-95'
                            : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {settingsForm.isOpen ? '🟢 Buka' : '🔴 Tutup'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-name">Nama Toko / Restoran</label>
                      <input
                        id="set-store-name"
                        type="text"
                        required
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-address">Alamat Lengkap Cabang</label>
                      <textarea
                        id="set-store-address"
                        rows={3}
                        required
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-phone">Nomor Telepon Kantor</label>
                      <input
                        id="set-store-phone"
                        type="text"
                        required
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-wa">Nomor WhatsApp Pelanggan (Format Internasional: 628...)</label>
                      <input
                        id="set-store-wa"
                        type="text"
                        required
                        placeholder="Contoh: 628123456789"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Rekening Pembayaran Bank</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-name">Nama Bank</label>
                          <input
                            id="set-bank-name"
                            type="text"
                            placeholder="Contoh: Bank Central Asia (BCA)"
                            value={settingsForm.bankName}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankName: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-acc">Nomor Rekening</label>
                          <input
                            id="set-bank-acc"
                            type="text"
                            placeholder="Contoh: 8420994981"
                            value={settingsForm.bankAccountNumber}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-holder">Nama Pemilik Rekening</label>
                          <input
                            id="set-bank-holder"
                            type="text"
                            placeholder="Contoh: D'Foria Kitchen Indonesia"
                            value={settingsForm.bankAccountHolder}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountHolder: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Jam Operasional Toko</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-opening-hour">Jam Buka</label>
                          <input
                            id="set-opening-hour"
                            type="text"
                            placeholder="Contoh: 08:00"
                            required
                            value={settingsForm.openingHour || '08:00'}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, openingHour: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-closing-hour">Jam Tutup</label>
                          <input
                            id="set-closing-hour"
                            type="text"
                            placeholder="Contoh: 22:00"
                            required
                            value={settingsForm.closingHour || '22:00'}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, closingHour: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-center"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 leading-normal">
                        Format waktu menggunakan format 24 jam (JJ:MM), misal: 08:00 s.d 22:00. Status buka/tutup toko di halaman utama akan disesuaikan secara otomatis berdasarkan jam operasional ini.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Informasi Lokasi & Peta (Google Maps)</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-location-city">Nama Kota / Pulau / Wilayah</label>
                          <input
                            id="set-location-city"
                            type="text"
                            placeholder="Contoh: Pulau Weh - Kota Sabang"
                            value={settingsForm.locationCity || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, locationCity: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-location-province">Provinsi / Negara</label>
                          <input
                            id="set-location-province"
                            type="text"
                            placeholder="Contoh: Aceh, Indonesia"
                            value={settingsForm.locationProvince || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, locationProvince: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-maps-url">Link Peta Google Maps (Pencarian / Pin Lokasi)</label>
                          <input
                            id="set-maps-url"
                            type="text"
                            placeholder="Contoh: https://www.google.com/maps/search/?api=1&query=..."
                            value={settingsForm.mapsUrl || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mapsUrl: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-[11px]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                            Masukkan tautan/URL Google Maps agar pelanggan dapat mengeklik tombol "Lihat di Maps" di halaman depan untuk langsung menavigasi ke restoran Anda.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        id="btn-save-settings-submit"
                        type="submit"
                        disabled={saveLoading}
                        className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {saveLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Perbarui Profil Toko</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Security/Password & System Info (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Mode status block */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft space-y-4">
                  <h3 className="font-serif font-bold text-base text-gray-800 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <Database size={16} className="text-primary" />
                    <span>Integrasi Database Supabase</span>
                  </h3>
                  
                  {dbService.isCloudMode() ? (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 space-y-2 animate-fade-in text-xs">
                      <div className="flex items-center space-x-2">
                        <Globe size={16} className="text-emerald-600 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Terhubung ke Cloud Supabase</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                        Aplikasi saat ini aktif & terhubung secara realtime ke database cloud Supabase Anda! Semua data menu, stok, banner, kupon, testimonial, dan pesanan disinkronkan secara langsung.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/50 space-y-2 animate-fade-in text-xs">
                      <div className="flex items-center space-x-2">
                        <Database size={16} className="text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Mode Sandbox Lokal (Offline-first)</span>
                      </div>
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                        Database Supabase belum terkonfigurasi. Aplikasi berjalan menggunakan penyimpanan lokal (localStorage) browser Anda. Masukkan kredensial di bawah ini untuk mengaktifkannya secara langsung!
                      </p>
                    </div>
                  )}

                  {/* Supabase Dynamic Setup Form */}
                  <form onSubmit={handleSaveSupabase} className="space-y-4 pt-2 text-xs text-gray-600">
                    {supabaseStatus && (
                      <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                        supabaseStatus.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {supabaseStatus.type === 'success' ? (
                          <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                          <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                        )}
                        <div className="flex-1 font-medium leading-normal">{supabaseStatus.message}</div>
                        <button 
                          type="button"
                          onClick={() => setSupabaseStatus(null)}
                          className="text-gray-400 hover:text-gray-600 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="supa-url">Supabase Project URL</label>
                      <input
                        id="supa-url"
                        type="text"
                        placeholder="https://yourproject.supabase.co"
                        disabled={supabaseSetupLoading || initialSupaConfig.isEnv}
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className={`w-full bg-cream/15 px-3.5 py-2.5 rounded-xl border border-cream-dark/45 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
                          initialSupaConfig.isEnv ? 'bg-gray-100/50 cursor-not-allowed opacity-75' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="supa-key">Supabase Anon Public Key</label>
                      <input
                        id="supa-key"
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        disabled={supabaseSetupLoading || initialSupaConfig.isEnv}
                        value={supabaseAnonKeyInput}
                        onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                        className={`w-full bg-cream/15 px-3.5 py-2.5 rounded-xl border border-cream-dark/45 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
                          initialSupaConfig.isEnv ? 'bg-gray-100/50 cursor-not-allowed opacity-75' : ''
                        }`}
                      />
                    </div>

                    {initialSupaConfig.isEnv && (
                      <p className="text-[9px] text-gray-400 italic">
                        * Kredensial saat ini dimuat secara aman dari environment variable server / container host Anda.
                      </p>
                    )}

                    {!initialSupaConfig.isEnv && (
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={supabaseSetupLoading}
                          className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          {supabaseSetupLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Menghubungkan...</span>
                            </>
                          ) : (
                            <span>Aktifkan Supabase</span>
                          )}
                        </button>

                        {(supabaseUrlInput || supabaseAnonKeyInput) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSupabaseUrlInput('');
                              setSupabaseAnonKeyInput('');
                              if ((dbService as any).saveSupabaseConfig) {
                                (dbService as any).saveSupabaseConfig('', '');
                              }
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs px-3.5 rounded-xl transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                </div>

                {/* Database Setup Assistant & Verification Card */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft space-y-4 animate-fade-in">
                  <h3 className="font-serif font-bold text-base text-gray-800 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <Database size={16} className="text-primary" />
                    <span>Asisten Migrasi & Setup Database</span>
                  </h3>

                  <div className="space-y-4 text-xs text-gray-600">
                    <p className="leading-relaxed">
                      Gunakan asisten ini untuk membuat seluruh struktur tabel (<strong className="text-gray-800">8 tabel utama</strong>), mengaktifkan <strong className="text-gray-800">RLS (Row Level Security)</strong>, mengaktifkan <strong className="text-gray-800">Realtime</strong>, serta memasukkan <strong className="text-gray-800">data contoh</strong> secara instan.
                    </p>

                    {/* Step 1 */}
                    <div className="bg-cream/10 rounded-2xl p-4 border border-cream-dark/20 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                        <strong className="text-gray-800">Salin Script Migrasi SQL</strong>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Script ini mencakup pembuatan tabel <code className="bg-cream-dark/20 px-1 rounded text-primary">menu</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">categories</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">banners</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">promos</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">orders</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">order_items</code>, <code className="bg-cream-dark/20 px-1 rounded text-primary">customers</code>, dan <code className="bg-cream-dark/20 px-1 rounded text-primary">settings</code>.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopySql}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                          copiedSql
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {copiedSql ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span>Berhasil Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Salin Script SQL Setup</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-cream/10 rounded-2xl p-4 border border-cream-dark/20 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                        <strong className="text-gray-800">Jalankan di Supabase</strong>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Buka dashboard Supabase Anda, arahkan ke tab <strong className="text-gray-700">SQL Editor</strong>, buat query baru, tempel script SQL yang telah Anda salin, lalu klik tombol <strong className="text-emerald-700">Run</strong>.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-cream/10 rounded-2xl p-4 border border-cream-dark/20 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                        <strong className="text-gray-800">Verifikasi Struktur Database</strong>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Setelah query SQL berhasil dijalankan, klik tombol di bawah ini untuk memeriksa dan menguji hubungan ke setiap tabel di Supabase.
                      </p>

                      {verificationStatus && (
                        <div className={`p-3 rounded-xl border flex items-start space-x-2 text-[11px] transition-all animate-fade-in ${
                          verificationStatus.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {verificationStatus.type === 'success' ? (
                            <CheckCircle2 size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                          ) : (
                            <XCircle size={14} className="shrink-0 text-rose-600 mt-0.5" />
                          )}
                          <div className="flex-1 font-medium leading-normal">{verificationStatus.message}</div>
                          <button 
                            type="button"
                            onClick={() => setVerificationStatus(null)}
                            className="text-gray-400 hover:text-gray-600 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleVerifyTables}
                        disabled={verificationLoading}
                        className="w-full bg-cream-dark/30 hover:bg-cream-dark/45 disabled:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-xl border border-cream-dark/40 transition-all flex items-center justify-center space-x-2 cursor-pointer text-[11px]"
                      >
                        {verificationLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            <span>Memverifikasi...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={12} />
                            <span>Verifikasi Status Tabel</span>
                          </>
                        )}
                      </button>

                      {/* Verification Status List */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-dark/20">
                        {[
                          { key: 'categories', label: 'categories', icon: Layers },
                          { key: 'menu', label: 'menu', icon: UtensilsCrossed },
                          { key: 'banners', label: 'banners', icon: Globe },
                          { key: 'promos', label: 'promos', icon: Tag },
                          { key: 'orders', label: 'orders', icon: ShoppingBag },
                          { key: 'order_items', label: 'order_items', icon: ShoppingBag },
                          { key: 'customers', label: 'customers', icon: Users },
                          { key: 'settings', label: 'settings', icon: SettingsIcon },
                        ].map((t) => {
                          const IconComp = t.icon;
                          const status = tableStatus[t.key];
                          return (
                            <div key={t.key} className="flex items-center justify-between p-2 bg-white rounded-xl border border-cream-dark/25 shadow-xs">
                              <div className="flex items-center space-x-1.5 text-gray-700 font-mono text-[10px] truncate max-w-[80px]">
                                <IconComp size={10} className="text-gray-400 shrink-0" />
                                <span className="truncate">{t.label}</span>
                              </div>
                              <div className="shrink-0">
                                {status === 'success' ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">✅ Ok</span>
                                ) : status === 'failed' ? (
                                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">❌ Error</span>
                                ) : (
                                  <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200">Pending</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Username Card */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <User size={16} className="text-primary" />
                    <span>Ubah Username Admin</span>
                  </h3>

                  {usernameStatus && (
                    <div className={`mb-5 p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                      usernameStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {usernameStatus.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="flex-1 font-medium">{usernameStatus.message}</div>
                      <button 
                        onClick={() => setUsernameStatus(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleChangeUsername} className="space-y-4 text-xs text-gray-600">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-new-username">Username Baru</label>
                      <input
                        id="set-new-username"
                        type="text"
                        required
                        placeholder="Masukkan username baru"
                        value={usernameForm.newUsername}
                        onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal">
                      Username baru minimal terdiri dari 3 karakter. Setelah diperbarui, username baru langsung digunakan untuk masuk ke panel admin ini.
                    </p>

                    <div className="pt-2">
                      <button
                        id="btn-save-username-submit"
                        type="submit"
                        disabled={usernameLoading}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {usernameLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Perbarui Username</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <Lock size={16} className="text-primary" />
                    <span>Ubah Kata Sandi Admin</span>
                  </h3>

                  {passwordStatus && (
                    <div className={`mb-5 p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                      passwordStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="flex-1 font-medium">{passwordStatus.message}</div>
                      <button 
                        onClick={() => setPasswordStatus(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 text-xs text-gray-600">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-new-password">Kata Sandi Baru</label>
                      <div className="relative">
                        <input
                          id="set-new-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Masukkan kata sandi baru"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-cream/15 pl-3.5 pr-10 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-confirm-password">Konfirmasi Kata Sandi Baru</label>
                      <input
                        id="set-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Ulangi kata sandi baru"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal">
                      Sandi baru minimal terdiri dari 6 karakter. Setelah diperbarui, kata sandi baru langsung aktif untuk masuk ke panel admin ini.
                    </p>

                    <div className="pt-2">
                      <button
                        id="btn-save-password-submit"
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {passwordLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Perbarui Kata Sandi</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
