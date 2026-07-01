/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { MenuItem, Order, Banner, StoreSettings, Coupon, OrderStatus, Testimonial } from '../types';

// ==========================================
// SUPABASE CONFIGURATION (HARDCODED DIRECTLY IN THE PROJECT)
// ==========================================

export const supabaseUrl: string = "https://kjfipyaoxtjccxjdarmg.supabase.co";
export const supabaseAnonKey: string = "sb_publishable_e3Lp4J17iJtfLpyznGxhUQ_pNRle9L7";

export const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== "https://PROJECT-ID.supabase.co" && 
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey && 
  supabaseAnonKey !== "PASTE_ANON_PUBLIC_KEY" && 
  supabaseAnonKey.trim() !== "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

if (isConfigured) {
  console.log("Supabase Client initialized successfully! Connected to:", supabaseUrl);
} else {
  console.warn("Supabase is NOT configured. Please paste your Supabase URL and Anon Key directly in /src/lib/supabase.ts to sync across all devices!");
}

function handleSupabaseError(actionName: string, error: any) {
  if (!error) return;
  console.warn(`[Supabase] Gagal pada ${actionName}:`, error);
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
    const orderWithFlag = { ...order, stockDecremented: true }; // Stock is decremented inside RPC or offline immediately

    if (!isConfigured) {
      // Local / Offline fallback (We still decrement stock locally for immediate client feedback!)
      const cachedMenus = getCached('df_cached_menus', DEFAULT_MENUS);
      
      // Validate stock locally
      for (const item of order.items) {
        const found = cachedMenus.find((m: any) => m.id === item.menuItemId);
        if (found && found.stock < item.quantity) {
          throw new Error(`Stok "${item.name}" tidak mencukupi (Tersisa: ${found.stock}).`);
        }
      }

      // Decrement stock locally
      const updatedMenus = cachedMenus.map((m: any) => {
        const item = order.items.find(it => it.menuItemId === m.id);
        if (item) {
          const newStock = Math.max(0, m.stock - item.quantity);
          return {
            ...m,
            stock: newStock,
            available: newStock > 0 && m.isAvailable !== false,
            isAvailable: newStock > 0 && m.isAvailable !== false
          };
        }
        return m;
      });
      setCached('df_cached_menus', updatedMenus);

      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = [orderWithFlag, ...cached.filter((o: any) => o.id !== order.id)];
      setCached('df_cached_orders', updated);
      return;
    }

    try {
      // Panggil RPC aman di Supabase (Transaksi tingkat database, aman dari race conditions!)
      const { data, error } = await supabase.rpc('create_order_secure', {
        p_order_id: order.id,
        p_customer_id: order.customerId || null,
        p_customer_name: order.customerName,
        p_table_number: order.tableNumber || '',
        p_phone_number: order.phoneNumber || '',
        p_notes: order.notes || '',
        p_items: order.items,
        p_total_amount: order.totalAmount,
        p_payment_method: order.paymentMethod,
        p_status: order.status,
        p_created_at: order.createdAt
      });

      if (error) {
        // Jika RPC belum ditambahkan di Supabase, fallback menggunakan alur biasa
        if (error.code === 'PGRST202' || error.message?.includes('does not exist')) {
          console.warn("RPC 'create_order_secure' tidak ditemukan di Supabase. Menggunakan alur fallback standard.");
          await this.addOrderFallback(order);
          return;
        }
        throw error;
      }

      if (data && data.success === false) {
        throw new Error(data.message || 'Gagal menyimpan pesanan.');
      }

      const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
      const updated = [orderWithFlag, ...cached.filter((o: any) => o.id !== order.id)];
      setCached('df_cached_orders', updated);
    } catch (err: any) {
      console.error("Gagal menyimpan order ke Supabase:", err);
      throw new Error(err.message || "Gagal menyimpan pesanan.");
    }
  },

  async addOrderFallback(order: Order): Promise<void> {
    const orderWithFlag = { ...order, stockDecremented: false };

    // 1. Simpan Customer
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

    // 2. Simpan Order
    const { error } = await supabase
      .from('orders')
      .upsert({
        id: orderWithFlag.id,
        customerId: orderWithFlag.customerId || null,
        customerName: orderWithFlag.customerName,
        tableNumber: orderWithFlag.tableNumber,
        phoneNumber: orderWithFlag.phoneNumber,
        notes: orderWithFlag.notes,
        items: orderWithFlag.items,
        total_amount: orderWithFlag.totalAmount,
        payment_method: orderWithFlag.paymentMethod,
        status: orderWithFlag.status,
        created_at: orderWithFlag.createdAt,
        stockDecremented: orderWithFlag.stockDecremented
      });

    if (error) throw error;

    // 3. Simpan Order Items
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

    // 4. Jalankan manual stock decrement sebagai fallback
    await this.decrementOrderStock(orderWithFlag.id);

    const cached = getCached('df_cached_orders', DEFAULT_ORDERS);
    const updated = [{ ...orderWithFlag, stockDecremented: true }, ...cached.filter((o: any) => o.id !== order.id)];
    setCached('df_cached_orders', updated);
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
                available: newStock > 0 && mData.isAvailable !== false,
                isAvailable: newStock > 0 && mData.isAvailable !== false
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

  subscribeCoupons(onUpdate: (coupons: Coupon[]) => void): () => void {
    if (!isConfigured) {
      onUpdate(getCached('df_cached_coupons', DEFAULT_COUPONS));
      return () => {};
    }

    this.getCoupons().then(onUpdate);

    const channelId = `coupons-changes-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promos' },
        () => {
          this.getCoupons().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  mustChangeAdminPassword(): boolean {
    return localStorage.getItem('df_must_change_password') === 'true';
  },

  async loginAdmin(username: string, password: string): Promise<boolean> {
    if (!isConfigured) {
      // Fallback local auth
      const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
      const savedPassword = localStorage.getItem('df_admin_password') || 'admin123';
      
      // Normal login check
      if (username === savedUsername && password === savedPassword) {
        localStorage.setItem('df_admin_username', username);
        localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
        localStorage.removeItem('df_must_change_password');
        return true;
      }

      // Local temp password check
      const localTempPassword = localStorage.getItem('df_local_temp_password');
      const localTempPasswordExpires = Number(localStorage.getItem('df_local_temp_password_expires') || '0');
      const localTempPasswordUsed = localStorage.getItem('df_local_temp_password_used') === 'true';

      if (
        username === savedUsername &&
        localTempPassword &&
        password === localTempPassword &&
        !localTempPasswordUsed &&
        new Date().getTime() < localTempPasswordExpires
      ) {
        localStorage.setItem('df_local_temp_password_used', 'true');
        localStorage.setItem('df_admin_username', username);
        localStorage.setItem('df_admin_password', password);
        localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
        localStorage.setItem('df_must_change_password', 'true');
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

        // 1. Normal login check
        if (username === credentials.username && password === credentials.password) {
          localStorage.setItem('df_admin_username', username);
          localStorage.setItem('df_admin_password', password);
          localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
          
          if (credentials.mustChangePassword) {
            // If they are logging in with normal password, clear mustChangePassword on server
            await supabase
              .from('settings')
              .upsert({
                id: 'admin_credentials',
                data: { ...credentials, mustChangePassword: false }
              });
            localStorage.removeItem('df_must_change_password');
          } else {
            localStorage.removeItem('df_must_change_password');
          }
          return true;
        }

        // 2. Temp password check
        if (
          username === credentials.username &&
          credentials.tempPassword &&
          password === credentials.tempPassword &&
          !credentials.tempPasswordUsed &&
          credentials.tempPasswordExpires &&
          new Date().getTime() < new Date(credentials.tempPasswordExpires).getTime()
        ) {
          // Valid temp password
          // Update DB immediately to mark as used
          const updatedData = {
            ...credentials,
            tempPasswordUsed: true,
            mustChangePassword: true
          };

          await supabase
            .from('settings')
            .upsert({
              id: 'admin_credentials',
              data: updatedData
            });

          localStorage.setItem('df_admin_username', username);
          localStorage.setItem('df_admin_password', password);
          localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
          localStorage.setItem('df_must_change_password', 'true');
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
          localStorage.removeItem('df_must_change_password');
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
      localStorage.removeItem('df_must_change_password');
      return true;
    }

    // Secondary local fallback for temp password
    const localTempPassword = localStorage.getItem('df_local_temp_password');
    const localTempPasswordExpires = Number(localStorage.getItem('df_local_temp_password_expires') || '0');
    const localTempPasswordUsed = localStorage.getItem('df_local_temp_password_used') === 'true';

    if (
      username === savedUsername &&
      localTempPassword &&
      password === localTempPassword &&
      !localTempPasswordUsed &&
      new Date().getTime() < localTempPasswordExpires
    ) {
      localStorage.setItem('df_local_temp_password_used', 'true');
      localStorage.setItem('df_admin_username', username);
      localStorage.setItem('df_admin_password', password);
      localStorage.setItem('df_admin_user', JSON.stringify({ username, loggedIn: true }));
      localStorage.setItem('df_must_change_password', 'true');
      return true;
    }

    return false;
  },

  async logoutAdmin(): Promise<void> {
    const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
    localStorage.setItem('df_admin_user', JSON.stringify({ username: savedUsername, loggedIn: false }));
    localStorage.removeItem('df_must_change_password');
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
      
      // Fetch latest credentials to preserve tempPassword state
      let credentials = { username: newUsername, password: currentPassword };
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'admin_credentials')
        .single();
      if (data && data.data) {
        credentials = { ...data.data, username: newUsername };
      }

      await supabase
        .from('settings')
        .upsert({
          id: 'admin_credentials',
          data: credentials
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
      localStorage.removeItem('df_must_change_password');
      return;
    }

    try {
      const currentUsername = localStorage.getItem('df_admin_username') || 'admin';
      
      let existingCredentials = { username: currentUsername, password: newPassword };
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'admin_credentials')
        .single();
      if (data && data.data) {
        existingCredentials = data.data;
      }

      await supabase
        .from('settings')
        .upsert({
          id: 'admin_credentials',
          data: { 
            ...existingCredentials, 
            username: currentUsername, 
            password: newPassword,
            mustChangePassword: false,
            tempPassword: null,
            tempPasswordExpires: null,
            tempPasswordUsed: true
          }
        });
      localStorage.setItem('df_admin_password', newPassword);
      localStorage.removeItem('df_must_change_password');
      console.log("Admin password updated successfully in Supabase!");
    } catch (err) {
      console.error("Gagal mengubah admin password di Supabase:", err);
    }
  },

  async resetAdminPasswordSecurely(): Promise<boolean> {
    // 1. Generate a random temporary password (8 characters alphanumeric, easily readable)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing O, 0, I, 1 characters
    let tempPassword = "";
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 2. Calculate expiration date (10 minutes from now)
    const expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    // 3. Get WhatsApp recipient number
    const settings = await this.getSettings();
    const adminWhatsApp = settings.whatsapp || settings.phone || "082255994981";

    // 4. Construct message
    const message = `Halo Admin D'Foria Kitchen,\n\n` +
      `Sistem mendeteksi permintaan pemulihan akun. Berikut adalah Password Sementara Anda:\n\n` +
      `*${tempPassword}*\n\n` +
      `Password ini hanya berlaku selama *10 menit* atau sampai *digunakan sekali* untuk login. Setelah berhasil masuk, Anda *wajib* membuat password baru demi alasan keamanan.\n\n` +
      `Terima kasih.`;

    // 5. Send message via WhatsApp service
    const { whatsappService } = await import('./whatsappService');
    const waSent = await whatsappService.sendMessage(adminWhatsApp, message);

    if (!waSent) {
      console.warn("WhatsApp message delivery failed, but updating credentials anyway.");
    }

    // 6. Save temp password securely
    if (!isConfigured) {
      localStorage.setItem('df_local_temp_password', tempPassword);
      localStorage.setItem('df_local_temp_password_expires', String(expiresAt.getTime()));
      localStorage.setItem('df_local_temp_password_used', 'false');
      console.log(`[SECURITY FALLBACK] Password sementara terbuat (local): ${tempPassword}`);
      return true;
    }

    try {
      let currentUsername = 'admin';
      let currentPassword = 'admin123';
      let existingData = {};
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'admin_credentials')
        .single();
      if (data && data.data) {
        existingData = data.data;
        currentUsername = data.data.username || 'admin';
        currentPassword = data.data.password || 'admin123';
      }

      await supabase
        .from('settings')
        .upsert({
          id: 'admin_credentials',
          data: {
            ...existingData,
            username: currentUsername,
            password: currentPassword, // Preserve current password until updated
            tempPassword: tempPassword,
            tempPasswordExpires: expiresAt.toISOString(),
            tempPasswordUsed: false,
            mustChangePassword: true
          }
        });
      
      console.log("[SECURITY] Temporary password saved to Supabase settings.");
      return true;
    } catch (err) {
      console.error("Gagal menyimpan password sementara di Supabase:", err);
      // Local fallback
      localStorage.setItem('df_local_temp_password', tempPassword);
      localStorage.setItem('df_local_temp_password_expires', String(expiresAt.getTime()));
      localStorage.setItem('df_local_temp_password_used', 'false');
      return true;
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
    throw new Error("Pengaturan koneksi lewat layar pengaturan (UI) telah dinonaktifkan. Silakan isi URL dan Anon Key langsung di dalam file 'src/lib/supabase.ts' agar tersinkronisasi di semua perangkat (HP orang lain juga) secara otomatis.");
  },
};
