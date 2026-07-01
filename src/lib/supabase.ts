/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { MenuItem, Order, Banner, StoreSettings, Coupon, OrderStatus, Testimonial } from '../types';

// ==========================================
// ENVIRONMENT VARIABLE CONFIGURATION & LAZY INITIALIZATION
// ==========================================

function cleanEnvValue(val: any): string {
  if (typeof val !== 'string') return '';
  let cleaned = val.trim();
  // Remove wrapping single/double quotes if present
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function getSavedValue(key: string, envVal: string): string {
  try {
    const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (saved) return cleanEnvValue(saved);
  } catch (e) {}
  return cleanEnvValue(envVal);
}

export const supabaseUrl = getSavedValue('df_supabase_url', import.meta.env.VITE_SUPABASE_URL);
export const supabaseAnonKey = getSavedValue('df_supabase_anon_key', import.meta.env.VITE_SUPABASE_ANON_KEY);

function validateConfig(url: string, key: string): boolean {
  const u = (url || '').trim();
  const k = (key || '').trim();
  if (!u || u === 'your_supabase_project_url' || !u.startsWith('http') || u.length > 512) {
    return false;
  }
  if (!k || k === 'your_supabase_anon_public_key' || k.startsWith('data:') || k.length > 2000 || k.includes(';base64,')) {
    return false;
  }
  return true;
}

export let isConfigured = validateConfig(supabaseUrl, supabaseAnonKey);

function handleSupabaseError(actionName: string, error: any) {
  if (!error) return;
  const errMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
  const isInvalidKey = errMsg.includes('Invalid API key') || 
                       errMsg.includes('invalid api key') || 
                       errMsg.includes('anon or service_role') ||
                       errMsg.includes('JWT');

  if (isInvalidKey) {
    if (isConfigured) {
      isConfigured = false;
      console.warn(`[Supabase] API Key tidak valid (${errMsg}). Mengaktifkan Offline Mode secara otomatis.`);
    }
  } else {
    console.warn(`[Supabase] Gagal pada ${actionName}:`, error);
  }
}

export let supabase: any = null;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log("Supabase Client initialized successfully! Connected to:", supabaseUrl);
  } catch (error) {
    console.error("Failed to initialize Supabase Client:", error);
  }
} else {
  console.warn("Supabase is NOT configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env settings or Admin Panel.");
}

// ==========================================
// SEED DATA FOR LOCAL FALLBACK OR AUTOMATIC CLOUD SEEDING
// ==========================================

export const DEFAULT_MENUS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Nasi Goreng Hijau',
    description: 'Nasi goreng hijau spesial dengan aroma daun kemangi yang harum, disajikan telur mata sapi dadar, lalapan segar, kerupuk udang, dan sambal hijau pilihan.',
    price: 12000,
    category: 'Makanan Berat',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600',
    bestseller: true,
    available: true,
    dailyQuota: 5,
    stock: 25,
    isAvailable: true
  },
  {
    id: 'menu-2',
    name: 'Ayam Bakar Madu',
    description: 'Ayam kampung bakar dilumuri saus madu manis gurih yang meresap sempurna hingga ke serat daging, disajikan hangat dengan lalapan.',
    price: 18000,
    category: 'Makanan Berat',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&q=80&w=600',
    bestseller: true,
    available: true,
    dailyQuota: 10,
    stock: 15,
    isAvailable: true
  },
  {
    id: 'menu-3',
    name: 'Kopi Susu Gula Aren',
    description: 'Espresso premium blend dipadukan susu segar dingin dan pemanis gula aren alami khas Nusantara yang manis legit menyegarkan.',
    price: 8000,
    category: 'Minuman',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
    bestseller: true,
    available: true,
    dailyQuota: 20,
    stock: 40,
    isAvailable: true
  },
  {
    id: 'menu-4',
    name: 'Es Teh Manis',
    description: 'Seduhan teh melati wangi pilihan disajikan dingin dengan es batu segar dan manis gula tebu asli.',
    price: 3000,
    category: 'Minuman',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600',
    bestseller: true,
    available: true,
    dailyQuota: 50,
    stock: 100,
    isAvailable: true
  },
  {
    id: 'menu-5',
    name: 'Roti Bakar Cokelat',
    description: 'Roti bakar empuk isi cokelat lumer bertabur keju parut melimpah di atasnya, cemilan manis penutup makan malam Anda.',
    price: 10000,
    category: 'Cemilan',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&q=80&w=600',
    bestseller: false,
    available: true,
    dailyQuota: 15,
    stock: 20,
    isAvailable: true
  }
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
    order: 1
  },
  {
    id: 'banner-2',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
    order: 2
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "D'Foria Kitchen",
  address: "Jl. Perdagangan No. 12, Pulau Weh - Kota Sabang",
  phone: "+6282255994981",
  whatsapp: "6282255994981",
  bankName: "Bank Central Asia (BCA)",
  bankAccountNumber: "8420994981",
  bankAccountHolder: "D'Foria Kitchen Indonesia",
  openingHour: "08:00",
  closingHour: "22:00",
  isOpen: true,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pulau+Weh+Kota+Sabang+Aceh",
  locationCity: "Pulau Weh - Kota Sabang",
  locationProvince: "Aceh, Indonesia"
};

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'DFORIA10',
    discountType: 'percentage',
    discountValue: 10,
    active: true
  },
  {
    id: 'coupon-2',
    code: 'DISKON5K',
    discountType: 'fixed',
    discountValue: 5000,
    active: true
  }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-916226',
    customerName: 'Zea',
    tableNumber: '05',
    notes: 'Sambal dipisah ya terima kasih',
    items: [
      {
        menuItemId: 'menu-1',
        name: 'Nasi Goreng Hijau',
        price: 12000,
        quantity: 1,
        notes: 'Telur setengah matang',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600'
      }
    ],
    totalAmount: 12000,
    paymentMethod: 'Cash',
    status: 'Menunggu Konfirmasi',
    createdAt: new Date().toISOString(),
    stockDecremented: false
  }
];

// ==========================================
// ERROR AND CONCURRENT CONNECTION HANDLER
// ==========================================

export let isQuotaExceeded = false;
export type QuotaListener = (exceeded: boolean) => void;
const quotaListeners = new Set<QuotaListener>();

export function addQuotaListener(listener: QuotaListener) {
  quotaListeners.add(listener);
  listener(isQuotaExceeded);
  return () => {
    quotaListeners.delete(listener);
  };
}

export function setQuotaExceeded(exceeded: boolean) {
  if (isQuotaExceeded !== exceeded) {
    isQuotaExceeded = exceeded;
    quotaListeners.forEach(l => l(exceeded));
  }
}

// Safe localStorage caching utils for offline tolerance and speed
const getCached = (key: string, fallback: any) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setCached = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// ==========================================
// CORE CRUD API WRAPPERS (SUPABASE ENGINE)
// ==========================================

export const dbService = {
  isCloudMode(): boolean {
    return isConfigured;
  },

  // --- IMAGES & FILE UPLOAD ---
  async uploadImage(file: File): Promise<string> {
    if (!isConfigured) {
      throw new Error("Supabase is not configured yet. Cannot upload image.");
    }
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('menu-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error("Error uploading image to Supabase Storage:", err);
      throw new Error(`Gagal mengupload gambar ke Supabase Storage: ${err.message || err}`);
    }
  },

  // --- MENU CRUD ---
  async getMenus(): Promise<MenuItem[]> {
    if (!isConfigured) {
      return getCached('df_cached_menus', DEFAULT_MENUS);
    }
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: MenuItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: Number(item.price),
          category: item.category,
          rating: Number(item.rating || 5),
          image: item.image_url || item.image || '',
          bestseller: !!item.bestseller,
          available: !!item.available,
          dailyQuota: item.dailyQuota !== undefined ? item.dailyQuota : 5,
          stock: item.stock !== undefined ? item.stock : 20,
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
        }));
        setCached('df_cached_menus', mapped);
        return mapped;
      } else {
        // Automatically seed empty Supabase database with DEFAULT_MENUS!
        console.log("Seeding empty Supabase menu table with defaults...");
        for (const item of DEFAULT_MENUS) {
          await supabase.from('menu').insert({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            rating: item.rating,
            image: item.image,
            bestseller: item.bestseller,
            available: item.available,
            dailyQuota: item.dailyQuota,
            stock: item.stock,
            isAvailable: item.isAvailable
          });
        }
        setCached('df_cached_menus', DEFAULT_MENUS);
        return DEFAULT_MENUS;
      }
    } catch (err: any) {
      handleSupabaseError("memuat menu", err);
      return getCached('df_cached_menus', DEFAULT_MENUS);
    }
  },

  subscribeMenus(onUpdate: (menus: MenuItem[]) => void): () => void {
    if (!isConfigured) {
      onUpdate(getCached('df_cached_menus', DEFAULT_MENUS));
      return () => {};
    }

    // Trigger initial load
    this.getMenus().then(onUpdate);

    // Subscribe to updates
    const channelId = `menu-changes-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu' },
        () => {
          this.getMenus().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async saveMenu(item: MenuItem): Promise<void> {
    const isNew = !item.id;
    const finalItem: MenuItem = {
      ...item,
      id: isNew ? 'menu-' + Date.now() : item.id
    };

    if (!isConfigured) {
      const cached = getCached('df_cached_menus', DEFAULT_MENUS);
      const updated = isNew 
        ? [...cached, finalItem]
        : cached.map((m: any) => m.id === finalItem.id ? finalItem : m);
      setCached('df_cached_menus', updated);
      return;
    }

    try {
      let categoryId = null;
      if (finalItem.category === 'Makanan Berat') categoryId = 'cat-1';
      else if (finalItem.category === 'Minuman') categoryId = 'cat-2';
      else if (finalItem.category === 'Cemilan') categoryId = 'cat-3';

      // Dynamically detect table columns to prevent "column does not exist" errors
      let hasImageUrlColumn = false;
      let hasImageColumn = false;
      try {
        const { data: colData, error: colErr } = await supabase.from('menu').select('*').limit(1);
        if (!colErr && colData && colData.length > 0) {
          const keys = Object.keys(colData[0]);
          hasImageUrlColumn = keys.includes('image_url');
          hasImageColumn = keys.includes('image');
        } else {
          // Default to try both if the table is empty
          hasImageUrlColumn = true;
          hasImageColumn = true;
        }
      } catch (colErr) {
        console.warn("Could not inspect columns, falling back:", colErr);
        hasImageColumn = true;
        hasImageUrlColumn = true;
      }

      const upsertPayload: any = {
        id: finalItem.id,
        name: finalItem.name,
        description: finalItem.description,
        price: finalItem.price,
        category: finalItem.category,
        category_id: categoryId,
        rating: finalItem.rating,
        bestseller: finalItem.bestseller,
        available: finalItem.available,
        dailyQuota: finalItem.dailyQuota || 5,
        stock: finalItem.stock !== undefined ? finalItem.stock : 20,
        isAvailable: finalItem.isAvailable !== undefined ? finalItem.isAvailable : true
      };

      if (hasImageColumn) {
        upsertPayload.image = finalItem.image;
      }
      if (hasImageUrlColumn) {
        upsertPayload.image_url = finalItem.image;
      }

      let { error } = await supabase.from('menu').upsert(upsertPayload);

      // Robust retry logic if column error occurs (fallback check)
      if (error && error.message?.includes('column') && error.message?.includes('does not exist')) {
        console.warn("Upsert failed, retrying with filtered columns:", error.message);
        const fallbackPayload = { ...upsertPayload };
        if (error.message.includes('image_url')) {
          delete fallbackPayload.image_url;
        } else if (error.message.includes('image')) {
          delete fallbackPayload.image;
        }
        const { error: retryError } = await supabase.from('menu').upsert(fallbackPayload);
        error = retryError;
      }

      if (error) throw error;

      // Update cache
      const cached = getCached('df_cached_menus', DEFAULT_MENUS);
      const updated = cached.filter((m: any) => m.id !== finalItem.id);
      updated.push(finalItem);
      setCached('df_cached_menus', updated);
    } catch (err: any) {
      console.error("Gagal menyimpan menu ke Supabase:", err);
      throw new Error(`Gagal menyimpan menu ke database Supabase: ${err.message || err}`);
    }
  },

  async deleteMenu(id: string): Promise<void> {
    if (!isConfigured) {
      const cached = getCached('df_cached_menus', DEFAULT_MENUS);
      const updated = cached.filter((m: any) => m.id !== id);
      setCached('df_cached_menus', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const cached = getCached('df_cached_menus', DEFAULT_MENUS);
      const updated = cached.filter((m: any) => m.id !== id);
      setCached('df_cached_menus', updated);
    } catch (err: any) {
      console.error("Gagal menghapus menu dari Supabase:", err);
      throw new Error(`Gagal menghapus menu dari database Supabase: ${err.message || err}`);
    }
  },

  // --- BANNER CRUD ---
  async getBanners(): Promise<Banner[]> {
    if (!isConfigured) {
      return getCached('df_cached_banners', DEFAULT_BANNERS);
    }
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Banner[] = data.map(b => ({
          id: b.id,
          imageUrl: b.imageUrl,
          order: b.order
        }));
        setCached('df_cached_banners', mapped);
        return mapped;
      } else {
        console.log("Seeding empty Supabase banners collection with defaults...");
        for (const banner of DEFAULT_BANNERS) {
          await supabase.from('banners').insert({
            id: banner.id,
            imageUrl: banner.imageUrl,
            order: banner.order
          });
        }
        setCached('df_cached_banners', DEFAULT_BANNERS);
        return DEFAULT_BANNERS;
      }
    } catch (err: any) {
      handleSupabaseError("memuat banner", err);
      return getCached('df_cached_banners', DEFAULT_BANNERS);
    }
  },

  subscribeBanners(onUpdate: (banners: Banner[]) => void): () => void {
    if (!isConfigured) {
      onUpdate(getCached('df_cached_banners', DEFAULT_BANNERS));
      return () => {};
    }

    this.getBanners().then(onUpdate);

    const channelId = `banners-changes-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        () => {
          this.getBanners().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async saveBanners(banners: Banner[]): Promise<void> {
    if (!isConfigured) {
      setCached('df_cached_banners', banners);
      return;
    }
    try {
      for (const b of banners) {
        await supabase
          .from('banners')
          .upsert({
            id: b.id,
            imageUrl: b.imageUrl,
            order: b.order
          });
      }
      setCached('df_cached_banners', banners);
    } catch (err) {
      console.error("Gagal menyimpan banners ke Supabase:", err);
    }
  },

  async saveBanner(banner: Banner): Promise<void> {
    const isNew = !banner.id;
    const finalBanner = {
      ...banner,
      id: isNew ? 'banner-' + Date.now() : banner.id
    };

    if (!isConfigured) {
      const cached = getCached('df_cached_banners', DEFAULT_BANNERS);
      const updated = cached.filter((b: any) => b.id !== finalBanner.id);
      updated.push(finalBanner);
      setCached('df_cached_banners', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('banners')
        .upsert({
          id: finalBanner.id,
          imageUrl: finalBanner.imageUrl,
          order: finalBanner.order
        });

      if (error) throw error;
    } catch (err) {
      console.error("Gagal menyimpan banner:", err);
    }
  },

  async deleteBanner(id: string): Promise<void> {
    if (!isConfigured) {
      const cached = getCached('df_cached_banners', DEFAULT_BANNERS);
      const updated = cached.filter((b: any) => b.id !== id);
      setCached('df_cached_banners', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Gagal menghapus banner:", err);
    }
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (!isConfigured) {
      return getCached('df_cached_orders', DEFAULT_ORDERS);
    }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');

      if (error) throw error;

      const mapped: Order[] = (data || []).map(o => ({
        id: o.id,
        customerId: o.customerId,
        customerName: o.customerName,
        tableNumber: o.tableNumber,
        phoneNumber: o.phoneNumber,
        notes: o.notes || '',
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        totalAmount: Number(o.total_amount),
        paymentMethod: o.payment_method as any,
        status: o.status as any,
        createdAt: o.created_at,
        stockDecremented: !!o.stockDecremented
      }));

      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCached('df_cached_orders', mapped);
      return mapped;
    } catch (err: any) {
      handleSupabaseError("mengambil orders", err);
      return getCached('df_cached_orders', DEFAULT_ORDERS);
    }
  },

  subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
    if (!isConfigured) {
      onUpdate(getCached('df_cached_orders', DEFAULT_ORDERS));
      return () => {};
    }

    this.getOrders().then(onUpdate);

    const channelId = `orders-changes-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          this.getOrders().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(o => o.customerId === customerId);
  },

  subscribeCustomerOrders(customerId: string, onUpdate: (orders: Order[]) => void): () => void {
    return this.subscribeOrders((allOrders) => {
      onUpdate(allOrders.filter(o => o.customerId === customerId));
    });
  },

  subscribeCustomerOrdersByPhone(phoneNumber: string, onUpdate: (orders: Order[]) => void): () => void {
    return this.subscribeOrders((allOrders) => {
      onUpdate(allOrders.filter(o => o.phoneNumber === phoneNumber));
    });
  },

  async addOrder(order: Order): Promise<void> {
    const orderWithFlag = { ...order, stockDecremented: false };

    if (!isConfigured) {
      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = [orderWithFlag, ...cached.filter((o: any) => o.id !== order.id)];
      setCached('df_cached_orders', updated);
      return;
    }

    try {
      // 1. Ensure Customer exists in customers table
      let finalCustomerId = orderWithFlag.customerId || '';
      if (orderWithFlag.customerName) {
        if (!finalCustomerId && orderWithFlag.phoneNumber) {
          finalCustomerId = 'cust-' + orderWithFlag.phoneNumber.replace(/[^0-9]/g, '');
        }
        if (!finalCustomerId) {
          finalCustomerId = 'cust-' + Date.now();
        }
        orderWithFlag.customerId = finalCustomerId;

        try {
          await supabase
            .from('customers')
            .upsert({
              id: finalCustomerId,
              name: orderWithFlag.customerName,
              phone: orderWithFlag.phoneNumber || ''
            });
        } catch (custErr) {
          console.error("Gagal menyimpan customer ke Supabase:", custErr);
        }
      }

      // 2. Save order to orders table
      const { error } = await supabase
        .from('orders')
        .upsert({
          id: orderWithFlag.id,
          customerId: orderWithFlag.customerId || null,
          customerName: orderWithFlag.customerName,
          tableNumber: orderWithFlag.tableNumber,
          phoneNumber: orderWithFlag.phoneNumber,
          notes: orderWithFlag.notes,
          items: orderWithFlag.items, // JSONB handles objects directly
          total_amount: orderWithFlag.totalAmount,
          payment_method: orderWithFlag.paymentMethod,
          status: orderWithFlag.status,
          created_at: orderWithFlag.createdAt,
          stockDecremented: orderWithFlag.stockDecremented
        });

      if (error) throw error;

      // 3. Save order items to order_items table for relational integrity
      if (orderWithFlag.items && orderWithFlag.items.length > 0) {
        try {
          for (let i = 0; i < orderWithFlag.items.length; i++) {
            const item = orderWithFlag.items[i];
            await supabase
              .from('order_items')
              .upsert({
                id: `${orderWithFlag.id}-item-${i}`,
                order_id: orderWithFlag.id,
                menu_item_id: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                notes: item.notes || '',
                image: item.image || ''
              });
          }
        } catch (itemErr) {
          console.error("Gagal menyimpan order_items ke Supabase:", itemErr);
        }
      }

      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = [orderWithFlag, ...cached.filter((o: any) => o.id !== order.id)];
      setCached('df_cached_orders', updated);
    } catch (err) {
      console.error("Gagal menyimpan order ke Supabase:", err);
    }
  },

  async decrementOrderStock(orderId: string): Promise<void> {
    if (!isConfigured) {
      console.log("decrementOrderStock offline mode");
      return;
    }
    try {
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (oError || !oData) {
        console.error(`Order ${orderId} tidak ditemukan.`);
        return;
      }

      const orderData = {
        ...oData,
        items: typeof oData.items === 'string' ? JSON.parse(oData.items) : oData.items,
        stockDecremented: !!oData.stockDecremented
      } as Order;

      if (orderData.stockDecremented) {
        console.log(`Order ${orderId} sudah didecrement stoknya.`);
        return;
      }

      // Loop over and decrement each item's stock
      for (const item of orderData.items) {
        if (item.menuItemId) {
          const { data: mData, error: mError } = await supabase
            .from('menu')
            .select('*')
            .eq('id', item.menuItemId)
            .single();

          if (!mError && mData) {
            const currentStock = mData.stock !== undefined ? Number(mData.stock) : 20;
            const newStock = Math.max(0, currentStock - item.quantity);
            await supabase
              .from('menu')
              .update({ 
                stock: newStock,
                available: newStock > 0 && mData.isAvailable !== false
              })
              .eq('id', item.menuItemId);
            console.log(`Stok menu ${item.name} berhasil diubah dari ${currentStock} menjadi ${newStock}`);
          }
        }
      }

      // Mark order as decremented
      await supabase
        .from('orders')
        .update({ stockDecremented: true })
        .eq('id', orderId);

    } catch (err) {
      console.error("Gagal melakukan decrement stok order:", err);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (!isConfigured) {
      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = cached.map((o: any) => o.id === orderId ? { ...o, status } : o);
      setCached('df_cached_orders', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = cached.map((o: any) => o.id === orderId ? { ...o, status } : o);
      setCached('df_cached_orders', updated);
    } catch (err) {
      console.error("Gagal mengupdate status order:", err);
    }
  },

  // --- STORE SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    if (!isConfigured) {
      return getCached('df_cached_settings', DEFAULT_SETTINGS);
    }
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'store_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.data) {
        const merged = { ...DEFAULT_SETTINGS, ...data.data };
        setCached('df_cached_settings', merged);
        return merged;
      } else {
        // Automatically seed settings
        await supabase
          .from('settings')
          .upsert({ id: 'store_settings', data: DEFAULT_SETTINGS });
        setCached('df_cached_settings', DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (err: any) {
      handleSupabaseError("mengambil settings", err);
      return getCached('df_cached_settings', DEFAULT_SETTINGS);
    }
  },

  subscribeSettings(onUpdate: (settings: StoreSettings) => void): () => void {
    if (!isConfigured) {
      onUpdate(getCached('df_cached_settings', DEFAULT_SETTINGS));
      return () => {};
    }

    this.getSettings().then(onUpdate);

    const channelId = `settings-changes-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        () => {
          this.getSettings().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    const cleaned = JSON.parse(JSON.stringify(settings));

    if (!isConfigured) {
      setCached('df_cached_settings', cleaned);
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'store_settings',
          data: cleaned
        });

      if (error) throw error;
      setCached('df_cached_settings', cleaned);
    } catch (err) {
      console.error("Gagal menyimpan settings ke Supabase:", err);
    }
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    if (!isConfigured) {
      return getCached('df_cached_coupons', DEFAULT_COUPONS);
    }
    try {
      const { data, error } = await supabase
        .from('promos')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Coupon[] = data.map(c => ({
          id: c.id,
          code: c.code,
          discountType: c.discountType as any,
          discountValue: Number(c.discountValue),
          active: !!c.active
        }));
        setCached('df_cached_coupons', mapped);
        return mapped;
      } else {
        // Seed default coupons into promos table
        for (const coupon of DEFAULT_COUPONS) {
          await supabase.from('promos').insert({
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            active: coupon.active
          });
        }
        setCached('df_cached_coupons', DEFAULT_COUPONS);
        return DEFAULT_COUPONS;
      }
    } catch (err: any) {
      handleSupabaseError("memuat coupons", err);
      return getCached('df_cached_coupons', DEFAULT_COUPONS);
    }
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const isNew = !coupon.id;
    const finalCoupon = {
      ...coupon,
      id: isNew ? 'coupon-' + Date.now() : coupon.id
    };

    if (!isConfigured) {
      const cached = getCached('df_cached_coupons', DEFAULT_COUPONS);
      const updated = cached.filter((c: any) => c.id !== finalCoupon.id);
      updated.push(finalCoupon);
      setCached('df_cached_coupons', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('promos')
        .upsert({
          id: finalCoupon.id,
          code: finalCoupon.code,
          discountType: finalCoupon.discountType,
          discountValue: finalCoupon.discountValue,
          active: finalCoupon.active
        });

      if (error) throw error;

      const cached = getCached('df_cached_coupons', DEFAULT_COUPONS);
      const updated = cached.filter((c: any) => c.id !== finalCoupon.id);
      updated.push(finalCoupon);
      setCached('df_cached_coupons', updated);
    } catch (err) {
      console.error("Gagal menyimpan coupon (promo) ke Supabase:", err);
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    if (!isConfigured) {
      const cached = getCached('df_cached_coupons', DEFAULT_COUPONS);
      const updated = cached.filter((c: any) => c.id !== id);
      setCached('df_cached_coupons', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('promos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const cached = getCached('df_cached_coupons', DEFAULT_COUPONS);
      const updated = cached.filter((c: any) => c.id !== id);
      setCached('df_cached_coupons', updated);
    } catch (err) {
      console.error("Gagal menghapus coupon (promo) dari Supabase:", err);
    }
  },

  // --- AUTH / ADMIN LOGIN ---
  async loginAdmin(username: string, password: string): Promise<boolean> {
    if (!isConfigured) {
      // Fallback local auth
      const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
      const savedPassword = localStorage.getItem('df_admin_password') || 'admin123';
      if (username === savedUsername && password === savedPassword) {
        localStorage.setItem('df_admin_username', username);
        localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
        return true;
      }
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'admin_credentials')
        .single();

      if (!error && data && data.data) {
        const credentials = data.data;
        if (username === credentials.username && password === credentials.password) {
          localStorage.setItem('df_admin_username', username);
          localStorage.setItem('df_admin_password', password);
          localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
          return true;
        }
      } else {
        // Automatically seed admin_credentials if empty
        if (username === 'admin' && password === 'admin123') {
          await supabase
            .from('settings')
            .upsert({
              id: 'admin_credentials',
              data: { username: 'admin', password: 'admin123' }
            });
          localStorage.setItem('df_admin_username', 'admin');
          localStorage.setItem('df_admin_password', 'admin123');
          localStorage.setItem('df_admin_user', JSON.stringify({ username: 'admin', loggedIn: true }));
          return true;
        }
      }
    } catch (err) {
      console.warn("Gagal mengecek admin credentials di Supabase:", err);
    }

    // Secondary local fallback if offline/no db item
    const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
    const savedPassword = localStorage.getItem('df_admin_password') || 'admin123';
    if (username === savedUsername && password === savedPassword) {
      localStorage.setItem('df_admin_username', username);
      localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
      return true;
    }
    return false;
  },

  async logoutAdmin(): Promise<void> {
    const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
    localStorage.setItem('df_admin_user', JSON.stringify({ username: savedUsername, loggedIn: false }));
  },

  isAdminLoggedIn(): boolean {
    const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
    return !!local.loggedIn;
  },

  getAdminUsername(): string {
    return localStorage.getItem('df_admin_username') || 'admin';
  },

  async changeAdminUsername(newUsername: string): Promise<void> {
    if (!isConfigured) {
      localStorage.setItem('df_admin_username', newUsername);
      const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
      if (local.loggedIn) {
        local.username = newUsername;
        localStorage.setItem('df_admin_user', JSON.stringify(local));
      }
      return;
    }

    try {
      const currentPassword = localStorage.getItem('df_admin_password') || 'admin123';
      await supabase
        .from('settings')
        .upsert({
          id: 'admin_credentials',
          data: { username: newUsername, password: currentPassword }
        });
      localStorage.setItem('df_admin_username', newUsername);

      const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
      if (local.loggedIn) {
        local.username = newUsername;
        localStorage.setItem('df_admin_user', JSON.stringify(local));
      }
      console.log("Admin username updated successfully in Supabase!");
    } catch (err) {
      console.error("Gagal mengubah admin username di Supabase:", err);
    }
  },

  async changeAdminPassword(newPassword: string): Promise<void> {
    if (!isConfigured) {
      localStorage.setItem('df_admin_password', newPassword);
      return;
    }

    try {
      const currentUsername = localStorage.getItem('df_admin_username') || 'admin';
      await supabase
        .from('settings')
        .upsert({
          id: 'admin_credentials',
          data: { username: currentUsername, password: newPassword }
        });
      localStorage.setItem('df_admin_password', newPassword);
      console.log("Admin password updated successfully in Supabase!");
    } catch (err) {
      console.error("Gagal mengubah admin password di Supabase:", err);
    }
  },

  // --- TESTIMONIALS ---
  async getTestimonials(): Promise<Testimonial[]> {
    if (!isConfigured) {
      return getCached('df_cached_testimonials', []);
    }
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*');

      if (error) throw error;

      const mapped: Testimonial[] = (data || []).map(t => ({
        id: t.id,
        customerName: t.customerName,
        message: t.message,
        createdAt: t.created_at
      }));

      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCached('df_cached_testimonials', mapped);
      return mapped;
    } catch (err: any) {
      handleSupabaseError("mengambil testimonials", err);
      return getCached('df_cached_testimonials', []);
    }
  },

  async saveTestimonial(customerName: string, message: string): Promise<Testimonial> {
    const id = 'testimonial-' + Date.now();
    const newTestimonial: Testimonial = {
      id,
      customerName,
      message,
      createdAt: new Date().toISOString()
    };

    if (!isConfigured) {
      const cached = getCached('df_cached_testimonials', []);
      const updated = [newTestimonial, ...cached];
      setCached('df_cached_testimonials', updated);
      return newTestimonial;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          id: newTestimonial.id,
          customerName: newTestimonial.customerName,
          message: newTestimonial.message,
          created_at: newTestimonial.createdAt
        });

      if (error) throw error;

      const cached = getCached('df_cached_testimonials', []);
      const updated = [newTestimonial, ...cached];
      setCached('df_cached_testimonials', updated);
    } catch (err) {
      console.error("Gagal menyimpan testimonial ke Supabase:", err);
    }
    return newTestimonial;
  },

  async deleteTestimonial(id: string): Promise<void> {
    if (!isConfigured) {
      const cached = getCached('df_cached_testimonials', []);
      const updated = cached.filter(t => t.id !== id);
      setCached('df_cached_testimonials', updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const cached = getCached('df_cached_testimonials', []);
      const updated = cached.filter(t => t.id !== id);
      setCached('df_cached_testimonials', updated);
    } catch (err) {
      console.error("Gagal menghapus testimonial dari Supabase:", err);
    }
  },

  async syncLocalToCloud(): Promise<{ success: boolean; menusUploaded: number; settingsUploaded: boolean }> {
    try {
      let menusUploaded = 0;
      let settingsUploaded = false;

      if (!isConfigured) return { success: false, menusUploaded: 0, settingsUploaded: false };

      // Sync Menus
      const cachedMenus = getCached('df_cached_menus', []);
      for (const item of cachedMenus) {
        await this.saveMenu(item);
        menusUploaded++;
      }

      // Sync Settings
      const cachedSettings = getCached('df_cached_settings', null);
      if (cachedSettings) {
        await this.saveSettings(cachedSettings);
        settingsUploaded = true;
      }

      return { success: true, menusUploaded, settingsUploaded };
    } catch (err) {
      console.error("Error dalam syncLocalToCloud:", err);
      return { success: false, menusUploaded: 0, settingsUploaded: false };
    }
  },

  async reconcileStockWithOrders(): Promise<void> {
    if (!isConfigured) return;
    try {
      console.log("Starting stock level reconciliation...");
      const menus = await this.getMenus();
      const orders = await this.getOrders();

      const orderedQuantities: { [key: string]: number } = {};
      for (const order of orders) {
        if (order.stockDecremented === false) continue;
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.menuItemId) {
              orderedQuantities[item.menuItemId] = (orderedQuantities[item.menuItemId] || 0) + item.quantity;
            }
          }
        }
      }

      for (const menu of menus) {
        const totalOrdered = orderedQuantities[menu.id] || 0;
        const startingStock = 20;
        const newStock = Math.max(0, startingStock - totalOrdered);
        await supabase
          .from('menu')
          .update({ 
            stock: newStock,
            available: newStock > 0 && menu.isAvailable !== false
          })
          .eq('id', menu.id);
      }
      console.log("Stock levels successfully reconciled!");
    } catch (err) {
      console.error("Error dalam reconcileStockWithOrders:", err);
    }
  },

  getSupabaseConfig() {
    return {
      url: supabaseUrl || '',
      anonKey: supabaseAnonKey || '',
      isEnv: true
    };
  },

  getSupabaseClient() {
    return supabase;
  },

  async saveSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      try {
        localStorage.removeItem('df_supabase_url');
        localStorage.removeItem('df_supabase_anon_key');
        sessionStorage.removeItem('df_supabase_url');
        sessionStorage.removeItem('df_supabase_anon_key');
      } catch (e) {}
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return false;
    }

    if (!trimmedUrl.startsWith('http')) {
      throw new Error("URL Supabase tidak valid. Harus dimulai dengan http:// atau https://");
    }
    if (trimmedUrl.length > 512 || trimmedUrl.includes('base64') || trimmedUrl.startsWith('data:')) {
      throw new Error("URL Supabase tidak valid. Harap periksa kembali URL yang Anda masukkan.");
    }
    if (trimmedKey.startsWith('data:') || trimmedKey.includes(';base64,') || trimmedKey.length > 2000) {
      throw new Error("Anon Key tidak valid. Pastikan Anda menyalin Anon Public Key dari dashboard Supabase Anda, bukan file gambar atau string base64.");
    }

    try {
      // Test connection with a simple table query or ping
      const testClient = createClient(trimmedUrl, trimmedKey);
      const { error } = await testClient.from('menu').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      try {
        localStorage.setItem('df_supabase_url', trimmedUrl);
        localStorage.setItem('df_supabase_anon_key', trimmedKey);
        sessionStorage.setItem('df_supabase_url', trimmedUrl);
        sessionStorage.setItem('df_supabase_anon_key', trimmedKey);
      } catch (e) {}
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (err: any) {
      console.error("Koneksi Supabase gagal:", err);
      throw new Error(`Koneksi gagal: ${err.message || 'Verifikasi URL dan Anon Key Anda'}`);
    }
  },
};
