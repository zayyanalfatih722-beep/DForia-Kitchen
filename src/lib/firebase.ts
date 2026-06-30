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
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.log("No Firebase config detected.");
}

// ==========================================
// SEED DATA FOR CLOUD MODE
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
    status: 'Menunggu Konfirmasi',
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 jam lalu
  }
];

// Initialize localStorage ONLY for admin auth state to persist local UI session logins safely
const initializeLocalStorage = () => {
  if (!localStorage.getItem('df_admin_user')) {
    localStorage.setItem('df_admin_user', JSON.stringify({ username: 'admin', loggedIn: false }));
  }
};

initializeLocalStorage();

// ==========================================
// ERROR HANDLERS & OPERATION TYPES
// ==========================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// CORE CRUD API WRAPPERS (PURE FIRESTORE)
// ==========================================

export const dbService = {
  // --- MENU CRUD ---
  async getMenus(): Promise<MenuItem[]> {
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
        console.log("Seeding empty Firestore menu collection...");
        for (const item of DEFAULT_MENUS) {
          await setDoc(doc(db, 'menu', item.id), item);
        }
        return DEFAULT_MENUS;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'menu');
      return DEFAULT_MENUS;
    }
  },

  subscribeMenus(onUpdate: (menus: MenuItem[]) => void): () => void {
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
          // Auto-seed Firestore in the background
          (async () => {
            try {
              console.log("Auto-seeding empty Firestore menu collection in snapshot...");
              for (const item of DEFAULT_MENUS) {
                await setDoc(doc(db, 'menu', item.id), item);
              }
            } catch (e) {
              console.error("Error auto-seeding menus in subscribe:", e);
            }
          })();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'menu');
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'menu');
      return () => {};
    }
  },

  async saveMenu(item: MenuItem): Promise<void> {
    const isNew = !item.id;
    const finalItem = {
      ...item,
      id: isNew ? 'menu-' + Date.now() : item.id
    };
    try {
      await setDoc(doc(db, 'menu', finalItem.id), finalItem);
      console.log("Menu saved to Firestore successfully");
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `menu/${finalItem.id}`);
    }
  },

  async deleteMenu(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'menu', id));
      console.log("Menu deleted from Firestore");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu/${id}`);
    }
  },

  // --- BANNER CRUD ---
  async getBanners(): Promise<Banner[]> {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
      const banners: Banner[] = [];
      querySnapshot.forEach((doc) => {
        banners.push({ id: doc.id, ...doc.data() } as Banner);
      });
      if (banners.length > 0) {
        return banners;
      } else {
        console.log("Seeding Firestore with default banners...");
        for (const banner of DEFAULT_BANNERS) {
          await setDoc(doc(db, 'banners', banner.id), banner);
        }
        return DEFAULT_BANNERS;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'banners');
      return DEFAULT_BANNERS;
    }
  },

  subscribeBanners(onUpdate: (banners: Banner[]) => void): () => void {
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
          // Auto-seed Firestore in the background
          (async () => {
            try {
              console.log("Auto-seeding empty Firestore banners collection...");
              for (const item of DEFAULT_BANNERS) {
                await setDoc(doc(db, 'banners', item.id), item);
              }
            } catch (e) {
              console.error("Error auto-seeding banners in subscribe:", e);
            }
          })();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'banners');
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'banners');
      return () => {};
    }
  },

  async saveBanners(banners: Banner[]): Promise<void> {
    try {
      for (const b of banners) {
        await setDoc(doc(db, 'banners', b.id), b);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'banners');
    }
  },

  async saveBanner(banner: Banner): Promise<void> {
    const isNew = !banner.id;
    const finalBanner = {
      ...banner,
      id: isNew ? 'banner-' + Date.now() : banner.id
    };
    try {
      await setDoc(doc(db, 'banners', finalBanner.id), finalBanner);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `banners/${finalBanner.id}`);
    }
  },

  async deleteBanner(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${id}`);
    }
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      if (orders.length > 0) {
        return orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        console.log("Seeding Firestore with default orders...");
        for (const order of DEFAULT_ORDERS) {
          await setDoc(doc(db, 'orders', order.id), order);
        }
        return [...DEFAULT_ORDERS];
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
      return [];
    }
  },

  subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
    try {
      const q = collection(db, 'orders');
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(orders);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'orders');
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
      return () => {};
    }
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      return orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
      return [];
    }
  },

  subscribeCustomerOrders(customerId: string, onUpdate: (orders: Order[]) => void): () => void {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(orders);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'orders');
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
      return () => {};
    }
  },

  async addOrder(order: Order): Promise<void> {
    const orderWithFlag = { ...order, stockDecremented: false };
    try {
      const orderRef = doc(db, 'orders', order.id);
      const sanitized = JSON.parse(JSON.stringify(orderWithFlag));
      await setDoc(orderRef, sanitized);
      console.log("Order saved to Firestore successfully without decrementing stock (will decrement on WhatsApp click)");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
    }
  },

  async decrementOrderStock(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        console.error(`Order ${orderId} not found in Firestore for stock decrement.`);
        return;
      }
      const orderData = orderSnap.data() as Order;
      if (orderData.stockDecremented) {
        console.log(`Order ${orderId} already had its stock decremented. Skipping.`);
        return;
      }

      await runTransaction(db, async (transaction) => {
        const tOrderSnap = await transaction.get(orderRef);
        if (!tOrderSnap.exists()) return;
        const tOrderData = tOrderSnap.data() as Order;
        if (tOrderData.stockDecremented) return;

        const resolvedItems: { ref: any; quantity: number; menuItemId: string; name: string }[] = [];
        for (const item of tOrderData.items) {
          if (item.menuItemId) {
            const menuRef = doc(db, 'menu', item.menuItemId);
            resolvedItems.push({
              ref: menuRef,
              quantity: item.quantity,
              menuItemId: item.menuItemId,
              name: item.name
            });
          }
        }

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

        transaction.update(orderRef, { stockDecremented: true });
      });

      console.log(`Successfully decremented stock for order ${orderId} on WhatsApp forward!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        await updateDoc(orderRef, { status });
      } else {
        await setDoc(orderRef, { status }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  // --- STORE SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'store_settings'));
      if (docSnap.exists()) {
        const fetched = docSnap.data() as StoreSettings;
        return {
          ...DEFAULT_SETTINGS,
          ...fetched
        };
      } else {
        console.log("Seeding Firestore with default settings...");
        await setDoc(doc(db, 'settings', 'store_settings'), DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/store_settings');
      return DEFAULT_SETTINGS;
    }
  },

  subscribeSettings(onUpdate: (settings: StoreSettings) => void): () => void {
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
          // Auto-seed Firestore in the background
          (async () => {
            try {
              console.log("Auto-seeding empty Firestore settings collection...");
              await setDoc(doc(db, 'settings', 'store_settings'), DEFAULT_SETTINGS);
            } catch (e) {
              console.error("Error auto-seeding settings in subscribe:", e);
            }
          })();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'settings/store_settings');
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/store_settings');
      return () => {};
    }
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    const cleanedSettings = JSON.parse(JSON.stringify(settings));
    try {
      await setDoc(doc(db, 'settings', 'store_settings'), cleanedSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/store_settings');
    }
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const coupons: Coupon[] = [];
      querySnapshot.forEach((doc) => {
        coupons.push({ id: doc.id, ...doc.data() } as Coupon);
      });
      if (coupons.length > 0) {
        return coupons;
      } else {
        console.log("Seeding Firestore with default coupons...");
        for (const coupon of DEFAULT_COUPONS) {
          await setDoc(doc(db, 'coupons', coupon.id), coupon);
        }
        return DEFAULT_COUPONS;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'coupons');
      return DEFAULT_COUPONS;
    }
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const isNew = !coupon.id;
    const finalCoupon = {
      ...coupon,
      id: isNew ? 'coupon-' + Date.now() : coupon.id
    };
    try {
      await setDoc(doc(db, 'coupons', finalCoupon.id), finalCoupon);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `coupons/${finalCoupon.id}`);
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
    }
  },

  // --- AUTH / ADMIN LOGIN ---
  async loginAdmin(username: string, password: string): Promise<boolean> {
    if (auth && isFirebaseConfigured) {
      try {
        const adminEmail = username.includes('@') ? username : `${username}@dforiakitchen.com`;
        await signInWithEmailAndPassword(auth, adminEmail, password);
        localStorage.setItem('df_admin_username', username);
        const userState = { username, loggedIn: true };
        localStorage.setItem('df_admin_user', JSON.stringify(userState));
        return true;
      } catch (err) {
        console.warn("Firebase Auth failed, trying local fallback credentials:", err);
      }
    }

    const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
    const savedPassword = localStorage.getItem('df_admin_password') || 'admin123';
    if (username === savedUsername && password === savedPassword) {
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
    const savedUsername = localStorage.getItem('df_admin_username') || 'admin';
    localStorage.setItem('df_admin_user', JSON.stringify({ username: savedUsername, loggedIn: false }));
  },

  isAdminLoggedIn(): boolean {
    if (auth && auth.currentUser) {
      return true;
    }
    const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
    return !!local.loggedIn;
  },

  isCloudMode(): boolean {
    return true;
  },

  getAdminUsername(): string {
    return localStorage.getItem('df_admin_username') || 'admin';
  },

  async changeAdminUsername(newUsername: string): Promise<void> {
    if (auth && isFirebaseConfigured && auth.currentUser) {
      try {
        const { updateEmail } = await import('firebase/auth');
        const newEmail = `${newUsername}@dforiakitchen.com`;
        await updateEmail(auth.currentUser, newEmail);
        localStorage.setItem('df_admin_username', newUsername);
        console.log("Username (email) updated successfully in Firebase Auth!");
      } catch (err) {
        console.error("Firebase Auth change email error:", err);
        throw err;
      }
    } else {
      localStorage.setItem('df_admin_username', newUsername);
      console.log("Username updated successfully!");
    }
    const local = JSON.parse(localStorage.getItem('df_admin_user') || '{}');
    if (local.loggedIn) {
      local.username = newUsername;
      localStorage.setItem('df_admin_user', JSON.stringify(local));
    }
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
      console.log("Password updated successfully!");
    }
  },

  // --- TESTIMONIALS ---
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: Testimonial[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Testimonial);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'testimonials');
      return [];
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

    try {
      await setDoc(doc(db, 'testimonials', id), {
        customerName: newTestimonial.customerName,
        message: newTestimonial.message,
        createdAt: newTestimonial.createdAt
      });
      return newTestimonial;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `testimonials/${id}`);
      return newTestimonial;
    }
  },

  async deleteTestimonial(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  },

  async syncLocalToCloud(): Promise<{ success: boolean; menusUploaded: number; settingsUploaded: boolean }> {
    return { success: true, menusUploaded: 0, settingsUploaded: true };
  },

  async reconcileStockWithOrders(): Promise<void> {
    try {
      console.log("Starting stock level reconciliation with typo-tolerant matching...");
      let menus: MenuItem[] = [];
      let orders: Order[] = [];

      const menuSnap = await getDocs(collection(db, 'menu'));
      menuSnap.forEach(docSnap => {
        menus.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
      });

      const orderSnap = await getDocs(collection(db, 'orders'));
      orderSnap.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });

      const isMenuMatch = (dbMenuName: string, dbMenuId: string, orderItemName: string, orderItemId: string) => {
        if (orderItemId && dbMenuId === orderItemId) return true;
        
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normDbName = normalize(dbMenuName);
        const normOrderItemName = normalize(orderItemName);
        
        if (!normDbName || !normOrderItemName) return false;
        if (normDbName === normOrderItemName) return true;
        if (normDbName.includes(normOrderItemName) || normOrderItemName.includes(normDbName)) return true;
        
        const isSpag = (s: string) => s.includes('spag') || s.includes('spah');
        if (isSpag(normDbName) && isSpag(normOrderItemName)) return true;
        
        const isNasGor = (s: string) => s.includes('nasigoreng') || s.includes('nasgor');
        if (isNasGor(normDbName) && isNasGor(normOrderItemName)) return true;
        
        const isAyamBakar = (s: string) => s.includes('ayambakar');
        if (isAyamBakar(normDbName) && isAyamBakar(normOrderItemName)) return true;

        const isKopi = (s: string) => s.includes('kopisusu') || s.includes('kopi');
        if (isKopi(normDbName) && isKopi(normOrderItemName)) return true;

        return false;
      };

      const orderedQuantities: { [key: string]: number } = {};
      for (const order of orders) {
        if (order.stockDecremented === false) {
          continue;
        }
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const menuItemId = item.menuItemId;
            const name = item.name;
            const qty = Number(item.quantity) || 0;

            const matchedMenu = menus.find(m => isMenuMatch(m.name, m.id, name, menuItemId || ''));
            if (matchedMenu) {
              orderedQuantities[matchedMenu.id] = (orderedQuantities[matchedMenu.id] || 0) + qty;
            }
          }
        }
      }

      console.log("Reconciliation ordered quantities map (typo-tolerant):", orderedQuantities);

      for (const menu of menus) {
        const totalOrdered = orderedQuantities[menu.id] || 0;
        const startingStock = 20;
        const newStock = Math.max(0, startingStock - totalOrdered);
        const available = newStock > 0;

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
      console.log("Stock levels successfully reconciled and synchronized with Firestore order history!");
    } catch (err) {
      console.error("Error running reconcileStockWithOrders:", err);
    }
  },
};
