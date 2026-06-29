/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  bestseller: boolean;
  available: boolean;
  dailyQuota?: number; // Quota harian
  stock: number;       // Sisa porsi yang tersedia
  isAvailable: boolean; // Status buka/tutup menu
}

export interface Banner {
  id: string;
  imageUrl: string;
  order: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export type OrderStatus = 'Menunggu Konfirmasi' | 'Sedang Diproses' | 'Sedang Diantar / Siap Diambil' | 'Selesai' | 'Dibatalkan';
export type PaymentMethod = 'Cash' | 'QRIS' | 'COD' | 'Transfer Bank';

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  tableNumber: string;
  phoneNumber?: string; // Nomor WhatsApp Pelanggan
  notes?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO string
  stockDecremented?: boolean;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  whatsapp: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  openingHour?: string;
  closingHour?: string;
  isOpen?: boolean;
  mapsUrl?: string;
  locationCity?: string;
  locationProvince?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  message: string;
  createdAt: string; // ISO string
}

