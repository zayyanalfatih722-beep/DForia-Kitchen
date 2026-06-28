/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { MenuItem, Order, Banner, StoreSettings, Coupon, OrderStatus, Testimonial } from '../types';

// Read Vite environment variables with direct fallbacks to firebase-applet-config.json to ensure
// all devices and browsers connect to the same cloud Firestore database rather than falling back to LocalStorage.
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyBq5JdQqFWvwWDvgV-33HX1qfDnmetkZu4",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0861366744.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0861366744",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0861366744.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "243132776184",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:243132776184:web:c690c7495944506c98450d"
};

const customDatabaseId = (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || "ai-studio-remixdforiakitch-32179079-ffa0-40a2-b895-41be55c04fbf";

// Check if Firebase is fully configured
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' && 
  !firebaseConfig.apiKey.includes('YOUR_');

let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = customDatabaseId ? getFirestore(app, customDatabaseId) : getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully in Cloud Mode! Database ID:", customDatabaseId || "default");
  } catch (error) {
    console.error("Failed to initialize Firebase, falling back to Local Sandbox Mode:", error);
  }
} else {
  console.log("No Firebase config detected. Running in Local Sandbox Mode (LocalStorage).");
}

// ==========================================
// SEED DATA FOR LOCAL SANDBOX MODE
// ==========================================

const DEFAULT_MENUS: MenuItem[] = [
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

const DEFAULT_BANNERS: Banner[] = [
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

const DEFAULT_SETTINGS: StoreSettings = {
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

const DEFAULT_COUPONS: Coupon[] = [
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

const DEFAULT_ORDERS: Order[] = [
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
      },
      {
        menuItemId: 'menu-3',
        name: 'Kopi Susu Gula Aren',
        price: 8000,
        quantity: 1,
        notes: 'Sedikit es',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600'
      }
    ],
    totalAmount: 20000,
    paymentMethod: 'QRIS',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 jam lalu
  }
];

// Seed localStorage if not existing
const initializeLocalStorage = () => {
  if (!localStorage.getItem('df_menus')) {
    localStorage.setItem('df_menus', JSON.stringify(DEFAULT_MENUS));
  }
  if (!localStorage.getItem('df_banners')) {
    localStorage.setItem('df_banners', JSON.stringify(DEFAULT_BANNERS));
  }
  if (!localStorage.getItem('df_settings')) {
    localStorage.setItem('df_settings', JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem('df_coupons')) {
    localStorage.setItem('df_coupons', JSON.stringify(DEFAULT_COUPONS));
  }
  if (!localStorage.getItem('df_orders')) {
    localStorage.setItem('df_orders', JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem('df_admin_user')) {
    localStorage.setItem('df_admin_user', JSON.stringify({ username: 'admin', loggedIn: false }));
  }
};

initializeLocalStorage();

// ==========================================
// CORE CRUD API WRAPPERS (DUAL-MODE BRIDGE)
// ==========================================

export const dbService = {
  // --- MENU CRUD ---
  async getMenus(): Promise<MenuItem[]> {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menus: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          menus.push({
            id: doc.id,
            ...data,
            stock: data.stock !== undefined ? data.stock : 20,
            isAvailable: data.isAvailable !== undefined ? data.isAvailable : (data.available !== undefined ? data.available : true)
          } as MenuItem);
        });
        if (menus.length > 0) {
          return menus;
        } else {
          // Auto-seed Firestore
          console.log("Seeding Firestore with default menus...");
          for (const item of DEFAULT_MENUS) {
            await setDoc(doc(db, 'menu', item.id), item);
          }
          return DEFAULT_MENUS;
        }
      } catch (err) {
        console.warn("Firestore error reading menus, fallback to local:", err);
      }
    }
    const localRaw = localStorage.getItem('df_menus');
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as MenuItem[];
      return parsed.map(m => ({
        ...m,
        stock: m.stock !== undefined ? m.stock : 20,
        isAvailable: m.isAvailable !== undefined ? m.isAvailable : (m.available !== undefined ? m.available : true)
      }));
    }
    return [];
  },

  subscribeMenus(onUpdate: (menus: MenuItem[]) => void): () => void {
    if (db) {
      try {
        const q = collection(db, 'menu');
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const menus: MenuItem[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            menus.push({
              id: doc.id,
              ...data,
              stock: data.stock !== undefined ? data.stock : 20,
              isAvailable: data.isAvailable !== undefined ? data.isAvailable : (data.available !== undefined ? data.available : true)
            } as MenuItem);
          });
          if (menus.length > 0) {
            onUpdate(menus);
          } else {
            onUpdate(DEFAULT_MENUS);
          }
        }, (err) => {
          console.error("onSnapshot error for menus:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up onSnapshot for menus:", err);
      }
    }
    
    const getLocal = () => {
      const localRaw = localStorage.getItem('df_menus');
      if (localRaw) {
        const parsed = JSON.parse(localRaw) as MenuItem[];
        return parsed.map(m => ({
          ...m,
          stock: m.stock !== undefined ? m.stock : 20,
          isAvailable: m.isAvailable !== undefined ? m.isAvailable : (m.available !== undefined ? m.available : true)
        }));
      }
      return DEFAULT_MENUS;
    };
    onUpdate(getLocal());
    const interval = setInterval(() => {
      onUpdate(getLocal());
    }, 3000);
    return () => clearInterval(interval);
  },

  async saveMenu(item: MenuItem): Promise<void> {
    const isNew = !item.id;
    const finalItem = {
      ...item,
      id: isNew ? 'menu-' + Date.now() : item.id
    };

    if (db) {
      try {
        await setDoc(doc(db, 'menu', finalItem.id), finalItem);
        console.log("Menu saved to Firestore");
      } catch (err) {
        console.error("Firestore error saving menu:", err);
      }
    }

    // Always update local storage as reliable backup
    const local = JSON.parse(localStorage.getItem('df_menus') || '[]');
    const index = local.findIndex((m: MenuItem) => m.id === finalItem.id);
    if (index >= 0) {
      local[index] = finalItem;
    } else {
      local.push(finalItem);
    }
    localStorage.setItem('df_menus', JSON.stringify(local));
  },

  async deleteMenu(id: string): Promise<void> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'menu', id));
      } catch (err) {
        console.error("Firestore error deleting menu:", err);
        throw err;
      }
    }

    const local = JSON.parse(localStorage.getItem('df_menus') || '[]');
    const updated = local.filter((m: MenuItem) => m.id !== id);
    localStorage.setItem('df_menus', JSON.stringify(updated));
  },

  // --- BANNER CRUD ---
  async getBanners(): Promise<Banner[]> {
    if (db) {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
        const banners: Banner[] = [];
        querySnapshot.forEach((doc) => {
          banners.push({ id: doc.id, ...doc.data() } as Banner);
        });
        if (banners.length > 0) {
          return banners;
        } else {
          // Auto-seed Firestore
          console.log("Seeding Firestore with default banners...");
          for (const banner of DEFAULT_BANNERS) {
            await setDoc(doc(db, 'banners', banner.id), banner);
          }
          return DEFAULT_BANNERS;
        }
      } catch (err) {
        console.warn("Firestore error reading banners, fallback to local:", err);
      }
    }
    return JSON.parse(localStorage.getItem('df_banners') || '[]');
  },

  subscribeBanners(onUpdate: (banners: Banner[]) => void): () => void {
    if (db) {
      try {
        const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const banners: Banner[] = [];
          querySnapshot.forEach((doc) => {
            banners.push({ id: doc.id, ...doc.data() } as Banner);
          });
          if (banners.length > 0) {
            onUpdate(banners);
          } else {
            onUpdate(DEFAULT_BANNERS);
          }
        }, (err) => {
          console.error("onSnapshot error for banners:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up onSnapshot for banners:", err);
      }
    }
    
    const getLocal = () => {
      return JSON.parse(localStorage.getItem('df_banners') || '[]');
    };
    onUpdate(getLocal());
    const interval = setInterval(() => {
      onUpdate(getLocal());
    }, 4000);
    return () => clearInterval(interval);
  },

  async saveBanners(banners: Banner[]): Promise<void> {
    if (db) {
      try {
        for (const b of banners) {
          await setDoc(doc(db, 'banners', b.id), b);
        }
      } catch (err) {
        console.error("Firestore error saving banners:", err);
      }
    }
    localStorage.setItem('df_banners', JSON.stringify(banners));
  },

  async saveBanner(banner: Banner): Promise<void> {
    const isNew = !banner.id;
    const finalBanner = {
      ...banner,
      id: isNew ? 'banner-' + Date.now() : banner.id
    };
    if (db) {
      try {
        await setDoc(doc(db, 'banners', finalBanner.id), finalBanner);
      } catch (err) {
        console.error("Firestore error saving banner:", err);
      }
    }
    const local = JSON.parse(localStorage.getItem('df_banners') || '[]');
    const index = local.findIndex((b: Banner) => b.id === finalBanner.id);
    if (index >= 0) {
      local[index] = finalBanner;
    } else {
      local.push(finalBanner);
    }
    localStorage.setItem('df_banners', JSON.stringify(local));
  },

  async deleteBanner(id: string): Promise<void> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'banners', id));
      } catch (err) {
        console.error("Firestore error deleting banner:", err);
        throw err;
      }
    }
    const local = JSON.parse(localStorage.getItem('df_banners') || '[]');
    const updated = local.filter((b: Banner) => b.id !== id);
    localStorage.setItem('df_banners', JSON.stringify(updated));
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        if (orders.length > 0) {
          return orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
          // Auto-seed Firestore with default orders
          console.log("Seeding Firestore with default orders...");
          for (const order of DEFAULT_ORDERS) {
            await setDoc(doc(db, 'orders', order.id), order);
          }
          return [...DEFAULT_ORDERS];
        }
      } catch (err) {
        console.warn("Firestore error reading orders, fallback to local:", err);
      }
    }
    const orders = JSON.parse(localStorage.getItem('df_orders') || '[]');
    // Sort descending by createdAt
    return orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
    if (db) {
      try {
        const q = collection(db, 'orders');
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const orders: Order[] = [];
          querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
          });
          // Sort descending by createdAt
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(orders);
        }, (err) => {
          console.error("onSnapshot error for orders:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up onSnapshot for orders:", err);
      }
    }

    const getLocal = () => {
      const localRaw = localStorage.getItem('df_orders');
      const orders = localRaw ? (JSON.parse(localRaw) as Order[]) : [];
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };
    onUpdate(getLocal());
    const interval = setInterval(() => {
      onUpdate(getLocal());
    }, 3000);
    return () => clearInterval(interval);
  },

  async addOrder(order: Order): Promise<void> {
    if (db) {
      try {
        // Pre-flight to resolve exact Document IDs for all items in the order
        const resolvedItems: { ref: any; quantity: number; name: string }[] = [];
        for (const item of order.items) {
          if (!item.menuItemId) continue;
          let menuDocRef = doc(db, 'menu', item.menuItemId);
          let menuSnap = await getDoc(menuDocRef);

          // Fallback search by name if ID is mismatched or not found in Firestore
          if (!menuSnap.exists()) {
            console.log(`Pre-flight: ID ${item.menuItemId} not found. Searching by name "${item.name}"...`);
            const q = query(collection(db, 'menu'), where('name', '==', item.name));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              const matchedDoc = querySnap.docs[0];
              menuDocRef = doc(db, 'menu', matchedDoc.id);
              console.log(`Pre-flight: Resolved name "${item.name}" to Firestore ID ${matchedDoc.id}`);
            } else {
              console.warn(`Pre-flight: Menu item "${item.name}" not found in Firestore. Skipping.`);
              continue;
            }
          }
          resolvedItems.push({
            ref: menuDocRef,
            quantity: item.quantity,
            name: item.name
          });
        }

        // Run transaction to atomically write order and decrement menu stock levels
        await runTransaction(db, async (transaction) => {
          // 1. Perform all reads first (required by Firestore transactions)
          const readSnapshots: { resolved: any; data: any }[] = [];
          for (const resolved of resolvedItems) {
            const snap = await transaction.get(resolved.ref);
            if (snap.exists()) {
              readSnapshots.push({
                resolved,
                data: snap.data()
              });
            }
          }

          // 2. Perform all writes
          // Save the order document
          const orderRef = doc(db, 'orders', order.id);
          transaction.set(orderRef, order);

          // Update each resolved menu item's stock level atomically
          for (const entry of readSnapshots) {
            const currentStock = entry.data.stock !== undefined ? Number(entry.data.stock) : 20;
            const newStock = Math.max(0, currentStock - entry.resolved.quantity);
            
            const updates: any = { stock: newStock };
            if (newStock <= 0) {
              updates.available = false;
            }
            transaction.update(entry.resolved.ref, updates);
            console.log(`Transaction: Atomically decremented ${entry.resolved.name} stock from ${currentStock} to ${newStock}`);
          }
        });

        console.log("Order saved and stock levels decremented atomically via Firestore transaction successfully!");
      } catch (err) {
        console.error("Firestore transaction error adding order or decrementing stock:", err);
      }
    }

    const local = JSON.parse(localStorage.getItem('df_orders') || '[]');
    local.push(order);
    localStorage.setItem('df_orders', JSON.stringify(local));

    // Also deduct stock locally
    try {
      const localMenus = JSON.parse(localStorage.getItem('df_menus') || '[]');
      let updatedAny = false;
      for (const item of order.items) {
        const idx = localMenus.findIndex((m: any) => m.id === item.menuItemId || m.name === item.name);
        if (idx >= 0) {
          const currentStock = localMenus[idx].stock !== undefined ? Number(localMenus[idx].stock) : 20;
          const newStock = Math.max(0, currentStock - item.quantity);
          localMenus[idx].stock = newStock;
          if (newStock <= 0) {
            localMenus[idx].available = false;
          }
          updatedAny = true;
        }
      }
      if (updatedAny) {
        localStorage.setItem('df_menus', JSON.stringify(localMenus));
      }
    } catch (err) {
      console.warn("Failed to update local menu stock:", err);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const local = JSON.parse(localStorage.getItem('df_orders') || '[]');
    const index = local.findIndex((o: Order) => o.id === orderId);
    let orderToSave: Order | null = null;
    if (index >= 0) {
      local[index].status = status;
      localStorage.setItem('df_orders', JSON.stringify(local));
      orderToSave = local[index];
    }

    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          await updateDoc(orderRef, { status });
        } else if (orderToSave) {
          // If it doesn't exist in Firestore but exists locally, write the whole thing
          await setDoc(orderRef, orderToSave);
        } else {
          // Fallback merge
          await setDoc(orderRef, { status }, { merge: true });
        }
      } catch (err) {
        console.error("Firestore error updating order status:", err);
      }
    }
  },

  // --- STORE SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'store_settings'));
        if (docSnap.exists()) {
          const fetched = docSnap.data() as StoreSettings;
          return {
            ...DEFAULT_SETTINGS,
            ...fetched
          };
        } else {
          // Auto-seed settings
          console.log("Seeding Firestore with default settings...");
          await setDoc(doc(db, 'settings', 'store_settings'), DEFAULT_SETTINGS);
          return DEFAULT_SETTINGS;
        }
      } catch (err) {
        console.warn("Firestore error reading settings, fallback to local:", err);
      }
    }
    const localRaw = localStorage.getItem('df_settings');
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as StoreSettings;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      };
    }
    return DEFAULT_SETTINGS;
  },

  subscribeSettings(onUpdate: (settings: StoreSettings) => void): () => void {
    if (db) {
      try {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'store_settings'), (docSnap) => {
          if (docSnap.exists()) {
            const fetched = docSnap.data() as StoreSettings;
            onUpdate({
              ...DEFAULT_SETTINGS,
              ...fetched
            });
          } else {
            onUpdate(DEFAULT_SETTINGS);
          }
        }, (err) => {
          console.error("onSnapshot error for settings:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up onSnapshot for settings:", err);
      }
    }
    
    const getLocal = () => {
      const localRaw = localStorage.getItem('df_settings');
      if (localRaw) {
        const parsed = JSON.parse(localRaw) as StoreSettings;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
      }
      return DEFAULT_SETTINGS;
    };
    onUpdate(getLocal());
    const interval = setInterval(() => {
      onUpdate(getLocal());
    }, 4000);
    return () => clearInterval(interval);
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    // Strip out undefined properties to avoid Firestore setDoc errors
    const cleanedSettings = JSON.parse(JSON.stringify(settings));
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'store_settings'), cleanedSettings);
      } catch (err) {
        console.error("Firestore error saving settings:", err);
        throw err;
      }
    }
    localStorage.setItem('df_settings', JSON.stringify(cleanedSettings));
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'coupons'));
        const coupons: Coupon[] = [];
        querySnapshot.forEach((doc) => {
          coupons.push({ id: doc.id, ...doc.data() } as Coupon);
        });
        if (coupons.length > 0) {
          return coupons;
        } else {
          // Auto-seed Firestore
          console.log("Seeding Firestore with default coupons...");
          for (const coupon of DEFAULT_COUPONS) {
            await setDoc(doc(db, 'coupons', coupon.id), coupon);
          }
          return DEFAULT_COUPONS;
        }
      } catch (err) {
        console.warn("Firestore error reading coupons, fallback to local:", err);
      }
    }
    return JSON.parse(localStorage.getItem('df_coupons') || '[]');
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const isNew = !coupon.id;
    const finalCoupon = {
      ...coupon,
      id: isNew ? 'coupon-' + Date.now() : coupon.id
    };

    if (db) {
      try {
        await setDoc(doc(db, 'coupons', finalCoupon.id), finalCoupon);
      } catch (err) {
        console.error("Firestore error saving coupon:", err);
      }
    }

    const local = JSON.parse(localStorage.getItem('df_coupons') || '[]');
    const index = local.findIndex((c: Coupon) => c.id === finalCoupon.id);
    if (index >= 0) {
      local[index] = finalCoupon;
    } else {
      local.push(finalCoupon);
    }
    localStorage.setItem('df_coupons', JSON.stringify(local));
  },

  async deleteCoupon(id: string): Promise<void> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (err) {
        console.error("Firestore error deleting coupon:", err);
        throw err;
      }
    }

    const local = JSON.parse(localStorage.getItem('df_coupons') || '[]');
    const updated = local.filter((c: Coupon) => c.id !== id);
    localStorage.setItem('df_coupons', JSON.stringify(updated));
  },

  // --- AUTH / ADMIN LOGIN ---
  async loginAdmin(username: string, password: string): Promise<boolean> {
    // 1. Check if real Firebase auth is configured
    if (auth && isFirebaseConfigured) {
      try {
        // Admin logins on Firebase would map username to email if desired,
        // or check directly if credentials match.
        // For simple beginners, we check credentials locally OR sign in to Firebase with custom email
        const adminEmail = username.includes('@') ? username : `${username}@dforiakitchen.com`;
        await signInWithEmailAndPassword(auth, adminEmail, password);
        return true;
      } catch (err) {
        console.warn("Firebase Auth failed, trying local fallback credentials:", err);
      }
    }

    // 2. Fallback local credentials (super easy for beginner local testing)
    const savedPassword = localStorage.getItem('df_admin_password') || 'admin123';
    if (username === 'admin' && password === savedPassword) {
      const userState = { username, loggedIn: true };
      localStorage.setItem('df_admin_user', JSON.stringify(userState));
      return true;
    }
    return false;
  },

  async logoutAdmin(): Promise<void> {
    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Signout Error:", err);
      }
    }
    localStorage.setItem('df_admin_user', JSON.stringify({ username: 'admin', loggedIn: false }));
  },

  isAdminLoggedIn(): boolean {
    if (auth && auth.currentUser) {
      return true;
    }
    const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
    return !!local.loggedIn;
  },

  isCloudMode(): boolean {
    return !!(db && isFirebaseConfigured);
  },

  async changeAdminPassword(newPassword: string): Promise<void> {
    if (auth && isFirebaseConfigured && auth.currentUser) {
      try {
        const { updatePassword } = await import('firebase/auth');
        await updatePassword(auth.currentUser, newPassword);
        console.log("Password updated successfully in Firebase Auth!");
      } catch (err) {
        console.error("Firebase Auth change password error:", err);
        throw err;
      }
    } else {
      localStorage.setItem('df_admin_password', newPassword);
      console.log("Password updated successfully in Local Sandbox!");
    }
  },

  async getTestimonials(): Promise<Testimonial[]> {
    if (db && isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list: Testimonial[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Testimonial);
        });
        return list;
      } catch (err) {
        console.warn("Firestore error reading testimonials, fallback to local:", err);
      }
    }
    const local = JSON.parse(localStorage.getItem('df_testimonials') || '[]');
    return local.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveTestimonial(customerName: string, message: string): Promise<Testimonial> {
    const id = 'testimonial-' + Date.now();
    const newTestimonial: Testimonial = {
      id,
      customerName,
      message,
      createdAt: new Date().toISOString()
    };

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'testimonials', id), {
          customerName: newTestimonial.customerName,
          message: newTestimonial.message,
          createdAt: newTestimonial.createdAt
        });
      } catch (err) {
        console.error("Firestore error saving testimonial:", err);
      }
    }

    const local = JSON.parse(localStorage.getItem('df_testimonials') || '[]');
    local.push(newTestimonial);
    localStorage.setItem('df_testimonials', JSON.stringify(local));
    return newTestimonial;
  },

  async deleteTestimonial(id: string): Promise<void> {
    if (db && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (err) {
        console.error("Firestore error deleting testimonial:", err);
        throw err;
      }
    }

    const local = JSON.parse(localStorage.getItem('df_testimonials') || '[]');
    const updated = local.filter((t: Testimonial) => t.id !== id);
    localStorage.setItem('df_testimonials', JSON.stringify(updated));
  },

  async syncLocalToCloud(): Promise<{ success: boolean; menusUploaded: number; settingsUploaded: boolean }> {
    let menusUploaded = 0;
    let settingsUploaded = false;
    
    if (db && isFirebaseConfigured) {
      try {
        // 1. Sync Menus
        const localMenus = JSON.parse(localStorage.getItem('df_menus') || '[]');
        if (localMenus.length > 0) {
          for (const item of localMenus) {
            await setDoc(doc(db, 'menu', item.id), item);
            menusUploaded++;
          }
        }
        
        // 2. Sync Settings
        const localSettings = JSON.parse(localStorage.getItem('df_settings') || '{}');
        if (localSettings && localSettings.storeName) {
          await setDoc(doc(db, 'settings', 'store'), localSettings);
          settingsUploaded = true;
        }

        // 3. Sync Banners
        const localBanners = JSON.parse(localStorage.getItem('df_banners') || '[]');
        if (localBanners.length > 0) {
          for (const banner of localBanners) {
            await setDoc(doc(db, 'banners', banner.id), banner);
          }
        }

        // 4. Sync Coupons
        const localCoupons = JSON.parse(localStorage.getItem('df_coupons') || '[]');
        if (localCoupons.length > 0) {
          for (const coupon of localCoupons) {
            await setDoc(doc(db, 'coupons', coupon.id), coupon);
          }
        }

        // 5. Sync Orders to Firestore to ensure order histories are fully merged
        const localOrders = JSON.parse(localStorage.getItem('df_orders') || '[]');
        if (localOrders.length > 0) {
          for (const order of localOrders) {
            await setDoc(doc(db, 'orders', order.id), order);
          }
        }

        // 6. Run automatic stock levels reconciliation to align Firestore with complete order history
        await this.reconcileStockWithOrders();

        return { success: true, menusUploaded, settingsUploaded };
      } catch (err) {
        console.error("Error during cloud sync:", err);
        throw err;
      }
    }
    return { success: false, menusUploaded: 0, settingsUploaded: false };
  },

  async reconcileStockWithOrders(): Promise<void> {
    try {
      console.log("Starting stock level reconciliation...");
      let menus: MenuItem[] = [];
      let orders: Order[] = [];

      if (db) {
        try {
          // Fetch menus and orders from Firestore
          const menuSnap = await getDocs(collection(db, 'menu'));
          menuSnap.forEach(docSnap => {
            menus.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
          });

          const orderSnap = await getDocs(collection(db, 'orders'));
          orderSnap.forEach(docSnap => {
            orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
          });
        } catch (dbErr) {
          console.error("Firestore error in reconciliation:", dbErr);
        }
      }

      // Fallback or merge with local storage
      const localMenus = JSON.parse(localStorage.getItem('df_menus') || '[]');
      const localOrders = JSON.parse(localStorage.getItem('df_orders') || '[]');

      // If menus list is empty (e.g., in local mode), use local menus or default menus
      if (menus.length === 0) {
        menus = localMenus.length > 0 ? localMenus : DEFAULT_MENUS;
      }
      // Combine orders to make sure we don't miss any local tests or synced ones
      const allOrdersMap = new Map<string, Order>();
      orders.forEach(o => allOrdersMap.set(o.id, o));
      localOrders.forEach((o: Order) => allOrdersMap.set(o.id, o));
      const allOrders = Array.from(allOrdersMap.values());

      // Calculate total ordered quantities per menu item (match by ID or Name)
      const orderedQuantities: { [key: string]: number } = {};
      for (const order of allOrders) {
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const menuItemId = item.menuItemId;
            const name = item.name;
            const qty = Number(item.quantity) || 0;

            const matchedMenu = menus.find(m => m.id === menuItemId || m.name === name);
            if (matchedMenu) {
              orderedQuantities[matchedMenu.id] = (orderedQuantities[matchedMenu.id] || 0) + qty;
            }
          }
        }
      }

      console.log("Reconciliation ordered quantities map:", orderedQuantities);

      // Update Firestore and LocalStorage
      for (const menu of menus) {
        const totalOrdered = orderedQuantities[menu.id] || 0;
        const startingStock = 20; // Default starting stock as explicitly stated by user
        const newStock = Math.max(0, startingStock - totalOrdered);
        const available = newStock > 0;

        // 1. Update Firestore if connected
        if (db) {
          try {
            const menuRef = doc(db, 'menu', menu.id);
            await updateDoc(menuRef, {
              stock: newStock,
              available: available,
              isAvailable: menu.isAvailable !== undefined ? (newStock > 0 ? menu.isAvailable : false) : available
            });
            console.log(`Firestore: Synchronized ${menu.name} stock to ${newStock} (${totalOrdered} ordered)`);
          } catch (fsErr) {
            console.warn(`Failed to update Firestore stock for ${menu.name}:`, fsErr);
          }
        }

        // 2. Update LocalStorage copy
        const idx = localMenus.findIndex((m: any) => m.id === menu.id);
        if (idx >= 0) {
          localMenus[idx].stock = newStock;
          localMenus[idx].available = available;
          if (newStock <= 0) {
            localMenus[idx].isAvailable = false;
          }
        }
      }

      if (localMenus.length > 0) {
        localStorage.setItem('df_menus', JSON.stringify(localMenus));
      }
      console.log("Stock levels successfully reconciled and synchronized with order history!");
    } catch (err) {
      console.error("Error running reconcileStockWithOrders:", err);
    }
  }
};
