/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, RotateCcw, ChevronRight, MessageSquareText } from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      // Get all orders from DB
      const allOrders = await dbService.getOrders();
      // Filter orders placed in this browser session/device
      const userOrderIds: string[] = JSON.parse(localStorage.getItem('df_user_order_ids') || '[]');

      // If user placed orders, filter to show theirs.
      // If user hasn't placed any order yet, let's show all orders for the beginner's review & testing convenience!
      // This is extremely helpful because otherwise the page would be completely blank when they first open the preview.
      if (userOrderIds.length > 0) {
        const filtered = allOrders.filter(o => userOrderIds.includes(o.id));
        setOrders(filtered);
      } else {
        // Fallback: show all orders (e.g. the seeded ORD-916226)
        setOrders(allOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();

    // Set up a refresh timer to simulate real-time updates every 10 seconds!
    const interval = setInterval(() => {
      fetchUserOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusStyle = (status: OrderStatus) => {
    if (status === 'Diproses') {
      return 'bg-blue-50 text-blue-600 border border-blue-200';
    }
    if (status === 'Selesai') {
      return 'bg-green-50 text-green-600 border border-green-200';
    }
    return 'bg-amber-50 text-amber-600 border border-amber-200'; // Menunggu / Pending
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Riwayat Pesanan</span>
          <h1 className="font-serif text-2xl font-bold text-gray-800">Status Pesanan</h1>
        </div>
        <button
          onClick={fetchUserOrders}
          className="bg-white p-2 rounded-full border border-cream-dark/40 shadow-soft text-gray-500 hover:text-primary transition-all duration-300 cursor-pointer"
          title="Refresh live status"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="font-serif italic text-xs text-gray-400">Menghubungkan ke D'Foria Kitchen...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[24px] p-10 text-center border border-cream-dark/30 shadow-soft flex flex-col items-center">
          <div className="bg-cream p-5 rounded-full text-gray-400 mb-4">
            <ClipboardList size={42} />
          </div>
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-1.5">Belum Ada Pesanan</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed max-w-[80%]">
            Anda belum memesan apa pun dari D'Foria Kitchen hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] text-gray-400 bg-white p-2.5 rounded-xl border border-cream-dark/30 shadow-soft text-center italic">
            ● Status pesanan di bawah otomatis diperbarui setiap 10 detik.
          </p>
          {orders.map((order) => (
            <div
              id={`order-status-card-${order.id}`}
              key={order.id}
              className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-3.5"
            >
              {/* Order Header: ID & Status */}
              <div className="flex items-center justify-between border-b border-cream/50 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Order ID</span>
                  <p className="font-mono text-xs font-bold text-gray-700">{order.id}</p>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                  {order.status === 'Pending' ? 'Menunggu' : order.status}
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
                  <MessageSquareText size={12} className="text-primary mt-0.5" />
                  <span>Catatan: "{order.notes}"</span>
                </div>
              )}

              {/* Order Footer: Table #, Date & Total Price */}
              <div className="flex items-center justify-between pt-3 border-t border-cream/50 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Meja Pelanggan</span>
                  <span className="font-semibold text-gray-700">Meja {order.tableNumber}</span>
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
