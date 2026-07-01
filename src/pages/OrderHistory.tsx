/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  ChevronRight, 
  MessageSquareText, 
  Phone, 
  Wifi, 
  Check, 
  Edit2, 
  Link2, 
  Search, 
  X 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Phone synchronization states
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('df_customer_phone') || '');
  const [phoneInput, setPhoneInput] = useState(() => localStorage.getItem('df_customer_phone') || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const getOrCreateCustomerId = () => {
    let customerId = localStorage.getItem('df_customer_id');
    if (!customerId) {
      customerId = 'cust_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('df_customer_id', customerId);
    }
    return customerId;
  };

  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    if (phoneNumber.trim()) {
      // Clean up search query for stability
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      console.log("Subscribing to orders via WhatsApp Phone:", cleanPhone);
      
      unsubscribe = dbService.subscribeCustomerOrdersByPhone(cleanPhone, (fetchedOrders) => {
        setOrders(fetchedOrders);
        setLoading(false);
      });
    } else {
      const customerId = getOrCreateCustomerId();
      console.log("Subscribing to orders via local Customer ID fallback:", customerId);
      
      unsubscribe = dbService.subscribeCustomerOrders(customerId, (fetchedOrders) => {
        setOrders(fetchedOrders);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, [phoneNumber]);

  const handleConnectPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanInput = phoneInput.trim().replace(/[^0-9]/g, '');
    if (!cleanInput) {
      setPhoneError('Nomor WhatsApp tidak boleh kosong!');
      return;
    }

    if (cleanInput.length < 9) {
      setPhoneError('Nomor WhatsApp terlalu pendek!');
      return;
    }

    localStorage.setItem('df_customer_phone', cleanInput);
    setPhoneNumber(cleanInput);
    setIsEditingPhone(false);
  };

  const handleDisconnectPhone = () => {
    if (window.confirm('Apakah Anda yakin ingin memutus koneksi nomor WhatsApp ini?')) {
      localStorage.removeItem('df_customer_phone');
      setPhoneNumber('');
      setPhoneInput('');
      setIsEditingPhone(false);
      setPhoneError('');
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusStyle = (status: OrderStatus) => {
    if (status === 'Sedang Diproses') {
      return 'bg-blue-50 text-blue-600 border border-blue-200';
    }
    if (status === 'Sedang Diantar / Siap Diambil') {
      return 'bg-purple-50 text-purple-600 border border-purple-200';
    }
    if (status === 'Selesai') {
      return 'bg-green-50 text-green-600 border border-green-200';
    }
    if (status === 'Dibatalkan') {
      return 'bg-red-50 text-red-600 border border-red-200';
    }
    return 'bg-amber-50 text-amber-600 border border-amber-200'; // Menunggu Konfirmasi
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Riwayat Pesanan</span>
          <h1 className="font-serif text-2xl font-bold text-gray-800">Status Pesanan</h1>
        </div>
      </div>

      {/* Multi-Device Synchronization Panel */}
      <div className="bg-white rounded-[24px] p-4.5 border border-cream-dark/30 shadow-soft">
        {phoneNumber && !isEditingPhone ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100 shrink-0">
                <Link2 size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold block">Tersambung Ke Cloud</span>
                <span className="font-mono text-xs font-bold text-gray-700 truncate block">WhatsApp: {phoneNumber}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                title="Ubah Nomor"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleDisconnectPhone}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Putuskan Koneksi"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectPhone} className="space-y-3">
            <div className="flex items-start space-x-2.5">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/15 shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800 leading-tight">Sinkronisasi Cloud WhatsApp</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Masukkan nomor WhatsApp Anda untuk menyinkronkan & memantau semua pesanan Anda secara real-time dari HP/perangkat mana saja!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-cream text-xs px-3 py-2.5 rounded-xl border border-cream-dark/50 focus:outline-none focus:border-primary/50 text-gray-700 font-mono"
                />
                {isEditingPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneInput(phoneNumber);
                      setPhoneError('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft transition-all cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <Search size={13} />
                <span>Cari</span>
              </button>
            </div>
            {phoneError && (
              <p className="text-[10px] text-red-500 font-medium pl-1">{phoneError}</p>
            )}
          </form>
        )}
      </div>

      {/* Main Order Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="font-serif italic text-xs text-gray-400">Menghubungkan ke D'Foria Kitchen...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[24px] p-10 text-center border border-cream-dark/30 shadow-soft flex flex-col items-center animate-fade-in">
          <div className="bg-cream p-5 rounded-full text-gray-400 mb-4">
            <ClipboardList size={42} />
          </div>
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-1.5">Belum Ada Pesanan</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed max-w-[85%]">
            {phoneNumber 
              ? `Tidak ditemukan pesanan aktif untuk nomor WhatsApp ${phoneNumber}.`
              : `Anda belum memesan apa pun dari D'Foria Kitchen hari ini pada perangkat ini.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <p className="text-[10px] text-gray-400 bg-white p-2.5 rounded-xl border border-cream-dark/30 shadow-soft text-center italic flex items-center justify-center space-x-1.5">
            <Wifi size={11} className="text-emerald-500 animate-pulse" />
            <span>Status pesanan diperbarui secara real-time dari database D'Foria.</span>
          </p>
          {orders.map((order) => (
            <div
              id={`order-status-card-${order.id}`}
              key={order.id}
              className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-3.5 hover:border-primary/20 transition-all duration-300"
            >
              {/* Order Header: ID & Status */}
              <div className="flex items-center justify-between border-b border-cream/50 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Order ID</span>
                  <p className="font-mono text-xs font-bold text-gray-700 select-all">{order.id}</p>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items list */}
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-600 font-medium">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono text-[10px] bg-cream text-primary-light px-1.5 py-0.5 rounded font-bold">
                        {item.quantity}x
                      </span>
                      <span className="truncate text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-mono text-gray-500 text-[11px]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Order Notes if exists */}
              {order.notes && (
                <div className="bg-cream/30 p-2 rounded-xl text-[11px] text-gray-500 border border-cream-dark/15 flex items-start space-x-1.5">
                  <MessageSquareText size={12} className="text-primary mt-0.5 shrink-0" />
                  <span>Catatan: "{order.notes}"</span>
                </div>
              )}

              {/* Order Footer: Table #, Date & Total Price */}
              <div className="flex items-center justify-between pt-3 border-t border-cream/50 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">WhatsApp Pelanggan</span>
                  <span className="font-semibold text-gray-700 font-mono">{order.phoneNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Total Tagihan</span>
                  <span className="font-mono font-bold text-primary text-sm">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
