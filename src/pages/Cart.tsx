/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Ticket, ChevronRight, MessageSquareText } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { dbService } from '../lib/firebase';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onUpdateNotes: (menuItemId: string, notes: string) => void;
  onRemoveItem: (menuItemId: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon
}: CartProps) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState(appliedCoupon ? appliedCoupon.code : '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(appliedCoupon ? 'Kupon berhasil diterapkan!' : '');

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      onApplyCoupon(null);
      return;
    }

    try {
      const coupons = await dbService.getCoupons();
      const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);

      if (found) {
        onApplyCoupon(found);
        setCouponSuccess(`Kupon ${found.code} diterapkan! Diskon ${found.discountType === 'percentage' ? found.discountValue + '%' : formatPrice(found.discountValue)}`);
      } else {
        setCouponError('Kode kupon tidak valid atau sudah tidak aktif.');
        onApplyCoupon(null);
      }
    } catch (err) {
      console.error(err);
      setCouponError('Gagal memverifikasi kupon.');
    }
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  if (cart.length === 0) {
    return (
      <div className="pb-28 pt-12 px-4 max-w-md mx-auto text-center animate-fade-in">
        <div className="bg-white rounded-[24px] p-10 shadow-soft border border-cream-dark/30 flex flex-col items-center">
          <div className="bg-cream p-5 rounded-full text-primary mb-4">
            <ShoppingBag size={42} />
          </div>
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-1.5">Keranjang Kosong</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed max-w-[80%]">
            Anda belum menambahkan hidangan lezat ke dalam keranjang belanja.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-3.5 px-6 rounded-xl shadow-soft transition-all cursor-pointer"
          >
            Jelajahi Menu Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Pilihan Anda</span>
          <h1 className="font-serif text-2xl font-bold text-gray-800">Keranjang</h1>
        </div>
        <span className="bg-primary/10 text-primary font-mono text-xs font-bold px-3 py-1.5 rounded-full">
          {cart.length} Item
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3.5 mb-6">
        {cart.map((item, idx) => (
          <div
            id={`cart-item-card-${item.menuItem.id}`}
            key={item.menuItem.id}
            className="bg-white rounded-[20px] p-3.5 border border-cream-dark/30 shadow-soft flex flex-col space-y-3"
          >
            {/* Top row: Image & Name & Price */}
            <div className="flex space-x-3">
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="w-16 h-16 rounded-xl object-cover bg-cream"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-bold text-gray-800 truncate">{item.menuItem.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.menuItem.category}</p>
                <p className="font-mono text-xs font-bold text-primary mt-1">{formatPrice(item.menuItem.price)}</p>
              </div>
              <button
                id={`btn-remove-${item.menuItem.id}`}
                onClick={() => onRemoveItem(item.menuItem.id)}
                className="text-gray-300 hover:text-red-500 p-1 self-start transition-colors cursor-pointer"
                title="Hapus item"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Note text field */}
            <div className="bg-cream/40 px-3 py-2.5 rounded-xl border border-cream-dark/20 flex items-center space-x-2">
              <MessageSquareText size={14} className="text-primary-light" />
              <input
                id={`note-input-${item.menuItem.id}`}
                type="text"
                placeholder="Tambah catatan (contoh: pedas, dll.)"
                value={item.notes}
                onChange={(e) => onUpdateNotes(item.menuItem.id, e.target.value)}
                className="bg-transparent text-xs text-gray-600 placeholder-gray-400 flex-1 focus:outline-none"
              />
            </div>

            {/* Bottom Row: Quantity Editors & Total Price */}
            <div className="flex items-center justify-between pt-2 border-t border-cream/40">
              <span className="font-mono text-xs font-bold text-gray-500">
                Total: {formatPrice(item.menuItem.price * item.quantity)}
              </span>
              <div className="flex items-center space-x-3 bg-cream/70 px-2 py-1 rounded-full border border-cream-dark/30">
                <button
                  id={`btn-minus-${item.menuItem.id}`}
                  onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                  className="bg-white hover:bg-cream text-primary p-1 rounded-full transition-colors cursor-pointer"
                  title="Kurang"
                >
                  <Minus size={12} />
                </button>
                <span className="font-mono text-xs font-bold text-gray-700 w-5 text-center">{item.quantity}</span>
                <button
                  id={`btn-plus-${item.menuItem.id}`}
                  onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                  className="bg-white hover:bg-cream text-primary p-1 rounded-full transition-colors cursor-pointer"
                  title="Tambah"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Breakdowns */}
      <div className="bg-white rounded-[24px] p-4.5 border border-cream-dark/30 shadow-soft mb-6 space-y-3">
        <h3 className="font-serif text-sm font-bold text-gray-800 border-b border-cream/50 pb-2 mb-1">Rincian Pembayaran</h3>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Subtotal Item</span>
          <span className="font-mono font-bold text-gray-700">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-green-600 font-medium">
            <span>Diskon Kupon</span>
            <span className="font-mono font-bold">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Pajak & Layanan (Ppn 0%)</span>
          <span className="font-mono font-bold text-gray-700">{formatPrice(0)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-cream/50">
          <span>Total Pembayaran</span>
          <span className="font-mono text-primary text-base">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Checkout Button Routing */}
      <button
        id="btn-go-to-checkout"
        onClick={() => navigate('/checkout')}
        className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-4 px-6 rounded-2xl shadow-soft flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
      >
        <span>Lanjut ke Pembayaran</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
