/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Search 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Order, OrderStatus, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminOrders() {
  const navigate = useNavigate();

  // Shared entity state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('df_cached_orders');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [settings, setSettings] = useState<StoreSettings | null>(() => {
    try {
      const cached = localStorage.getItem('df_cached_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('df_cached_orders');
      return cached ? false : true;
    } catch (e) {
      return true;
    }
  });
  const [isLive, setIsLive] = useState(false);

  // Search orders
  const [orderQuery, setOrderQuery] = useState('');

  // Initial Load (Settings are fetched statically, orders are updated in real-time)
  const loadAllData = async () => {
    try {
      const fetchedSettings = await dbService.getSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    
    loadAllData();
    
    // Only show loading screen if there is no cache at all
    const hasCache = localStorage.getItem('df_cached_orders');
    if (!hasCache) {
      setLoading(true);
    }

    // If Firestore takes more than 3.5 seconds to respond, force use local cache to ensure admin isn't blocked!
    const fallbackTimeout = setTimeout(() => {
      try {
        const cached = localStorage.getItem('df_cached_orders');
        if (cached) {
          setOrders(JSON.parse(cached));
        }
      } catch (e) {}
      setLoading(false);
      setIsLive(false);
    }, 3500);

    const unsubscribe = dbService.subscribeOrders((fetchedOrders) => {
      clearTimeout(fallbackTimeout);
      setOrders(fetchedOrders);
      setLoading(false);
      setIsLive(true);
    });

    return () => {
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, [navigate]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic UI state update to guarantee instant select response
    setOrders(prevOrders => {
      const updated = prevOrders.map(o => o.id === orderId ? { ...o, status } : o);
      try {
        localStorage.setItem('df_cached_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await dbService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.error("Gagal mengupdate status pesanan ke cloud:", err);
    }
    loadAllData();
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderQuery.toLowerCase()) ||
    o.tableNumber.includes(orderQuery)
  );

  return (
    <div className="min-h-[100dvh] h-auto bg-cream pb-12">
      {/* Top Admin Navigation Header */}
      <AdminHeader />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif font-bold text-2xl text-gray-800">Manajemen Antrean Pesanan</h2>
                  {isLive ? (
                    <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-150 shadow-soft">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute shrink-0" />
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-150 animate-pulse shadow-soft">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                      <span>Connecting...</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Ubah status pesanan pelanggan secara real-time dari dapur atau pelayan.</p>
              </div>
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Search size={15} />
                </span>
                <input
                  id="admin-order-search"
                  type="text"
                  placeholder="Cari ID pesanan, nama pelanggan, meja..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full bg-white text-gray-700 placeholder-gray-400 text-xs pl-10 pr-4 py-3 rounded-xl border border-cream-dark/50 shadow-soft focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Orders table block */}
            <div className="bg-white rounded-[24px] border border-cream-dark/30 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/40 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-cream/50">
                      <th className="py-4.5 px-6">Order ID</th>
                      <th className="py-4.5 px-6">Detail Pelanggan</th>
                      <th className="py-4.5 px-6">Daftar Hidangan</th>
                      <th className="py-4.5 px-6">Metode</th>
                      <th className="py-4.5 px-6">Total Pembayaran</th>
                      <th className="py-4.5 px-6">Status & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream/35 text-xs text-gray-600">
                    {filteredOrders.map((o) => {
                      const isNew = o.status === 'Menunggu Konfirmasi';
                      return (
                        <tr 
                          key={o.id} 
                          className={`hover:bg-cream/15 transition-all duration-500 align-top ${
                            isNew ? 'bg-amber-50/60 border-l-4 border-l-[#7B1E3A] animate-pulse' : ''
                          }`}
                        >
                          <td className="py-4.5 px-6 font-mono font-bold text-gray-800">{o.id}</td>
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-gray-800">{o.customerName}</p>
                              {isNew && (
                                <span className="bg-[#7B1E3A] text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-bounce shadow-soft shrink-0">
                                  BARU
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-primary font-semibold mt-0.5">Meja {o.tableNumber || '-'}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {o.createdAt ? (() => {
                              try {
                                return new Date(o.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
                              } catch (e) {
                                return '--:--';
                              }
                            })() : '--:--'} WIB
                          </p>
                        </td>
                        <td className="py-4.5 px-6 space-y-1 max-w-xs">
                          {(o.items || []).map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] bg-cream/30 p-1.5 rounded-lg border border-cream-dark/15">
                              <span>{it?.name || 'Item tidak diketahui'} <strong className="text-primary font-mono text-[10px]">x{it?.quantity || 1}</strong></span>
                              {it?.notes && <span className="text-[9px] text-amber-600 italic block">"{it.notes}"</span>}
                            </div>
                          ))}
                          {o.notes && (
                            <div className="text-[10px] text-gray-400 bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-1">
                              <strong>Catatan Meja:</strong> "{o.notes}"
                            </div>
                          )}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.paymentMethod === 'QRIS' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {o.paymentMethod || 'Tunai'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-mono font-bold text-gray-800">{formatPrice(o.totalAmount || 0)}</td>
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col space-y-1.5 min-w-[140px]">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center ${
                              o.status === 'Selesai' ? 'bg-green-50 text-green-600 border border-green-200' :
                              o.status === 'Sedang Diproses' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                              o.status === 'Sedang Diantar / Siap Diambil' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                              o.status === 'Dibatalkan' ? 'bg-red-50 text-red-600 border border-red-200' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {o.status}
                            </span>
                            <div className="flex flex-col space-y-1">
                              <label htmlFor={`select-status-order-${o.id}`} className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ubah Status:</label>
                              <select
                                id={`select-status-order-${o.id}`}
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="w-full bg-cream hover:bg-cream-dark/20 text-gray-700 text-[10px] font-bold py-1 px-1.5 rounded border border-cream-dark/50 focus:outline-none focus:ring-1 focus:ring-[#7B1E3A] cursor-pointer"
                              >
                                <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                <option value="Sedang Diproses">Sedang Diproses</option>
                                <option value="Sedang Diantar / Siap Diambil">Sedang Diantar / Siap Diambil</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Dibatalkan">Dibatalkan</option>
                              </select>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 font-serif italic">Belum ada pesanan yang sesuai pencarian.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
