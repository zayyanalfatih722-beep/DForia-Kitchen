/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Calculator, 
  ClipboardList, 
  Image as ImageIcon, 
  TrendingUp, 
  LineChart as ChartIcon, 
  Ticket, 
  Settings as SettingsIcon, 
  LogOut, 
  ShoppingBag, 
  ArrowRight,
  Home,
  CloudUpload,
  Check
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { MenuItem, Order, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

interface CountUpProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
}

function CountUp({ value, duration = 1200, formatter = (val) => String(val) }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const current = Math.floor(easeOutQuad(progress) * (value - startValue) + startValue);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{formatter(count)}</>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Shared entity state
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncInfo, setSyncInfo] = useState<{ menusUploaded: number } | null>(null);

  const handleCloudSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      const res = await dbService.syncLocalToCloud();
      if (res.success) {
        setSyncSuccess(true);
        setSyncInfo({ menusUploaded: res.menusUploaded });
        await loadAllData(); // Refresh metrics after sync
        setTimeout(() => setSyncSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data ke cloud:", err);
      alert("Gagal mengunggah data ke cloud. Pastikan jaringan internet Anda aktif.");
    } finally {
      setSyncing(false);
    }
  };

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrdersCount: 0,
    totalMenuCount: 0,
    totalOrdersCount: 0,
    outOfStockCount: 0,
    lowStockCount: 0
  });

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedMenus = await dbService.getMenus();
      const fetchedOrders = await dbService.getOrders();
      const fetchedSettings = await dbService.getSettings();

      setMenus(fetchedMenus);
      setOrders(fetchedOrders);
      setSettings(fetchedSettings);

      // Compute statistics
      const totalRevenue = fetchedOrders
        .filter(o => o.status === 'Selesai')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      
      const newOrders = fetchedOrders.filter(o => o.status === 'Pending').length;

      const outOfStockCount = fetchedMenus.filter(m => (m.stock !== undefined ? m.stock : 20) <= 0).length;
      const lowStockCount = fetchedMenus.filter(m => {
        const stk = m.stock !== undefined ? m.stock : 20;
        return stk > 0 && stk <= 5;
      }).length;

      setStats({
        totalRevenue,
        newOrdersCount: newOrders,
        totalMenuCount: fetchedMenus.length,
        totalOrdersCount: fetchedOrders.length,
        outOfStockCount,
        lowStockCount
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const handleLogout = async () => {
    dbService.logoutAdmin();
    navigate('/admin/login');
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 8 Navigation Card list configuration
  const navigationCards = [
    {
      title: 'Kasir',
      description: 'Input pesanan & pembayaran langsung',
      icon: <Calculator size={20} />,
      path: '/admin/cashier',
      color: 'text-primary bg-cream'
    },
    {
      title: 'Pesanan',
      description: 'Kelola antrean orderan pelanggan',
      icon: <ClipboardList size={20} />,
      path: '/admin/orders',
      color: 'text-amber-600 bg-amber-50',
      badge: stats.newOrdersCount > 0 ? stats.newOrdersCount : undefined
    },
    {
      title: 'Kelola Menu',
      description: 'Tambah & edit hidangan restoran',
      icon: <UtensilsCrossed size={20} />,
      path: '/admin/menu',
      color: 'text-primary bg-cream'
    },
    {
      title: 'Banner',
      description: 'Kelola promosi utama slide depan',
      icon: <ImageIcon size={20} />,
      path: '/admin/banner',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Keuangan',
      description: 'Buku besar ledger laba & omzet',
      icon: <TrendingUp size={20} />,
      path: '/admin/finance',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Laporan',
      description: 'Grafik analitik & performa bulanan',
      icon: <ChartIcon size={20} />,
      path: '/admin/reports',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Kupon',
      description: 'Manajemen kode promo diskon',
      icon: <Ticket size={20} />,
      path: '/admin/coupons',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'Pengaturan',
      description: 'Konfigurasi profil & detail toko',
      icon: <SettingsIcon size={20} />,
      path: '/admin/settings',
      color: 'text-gray-600 bg-gray-50'
    }
  ];

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Top Admin Header */}
      <AdminHeader />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-serif italic text-sm text-gray-400">Menghubungkan ke pusat data D'Foria...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Greeting section */}
            <div>
              <h2 className="font-serif font-bold text-2xl text-gray-800">Selamat Datang, Admin</h2>
              <p className="text-xs text-gray-400 mt-1">Gunakan panel kontrol di bawah ini untuk mengelola semua operasional restoran Anda.</p>
            </div>

            {/* Cloud Sync Status/Fix Banner */}
            <div className="bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-[24px] p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4AF37]"></div>
              <div className="space-y-1 md:max-w-2xl pl-1">
                <div className="flex items-center space-x-2 text-[#7B1E3A]">
                  <CloudUpload size={18} className="animate-bounce" />
                  <h3 className="font-serif font-bold text-sm">Sinkronisasi Menu & Data ke Cloud</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Jika sebelumnya Anda mengubah menu tapi di HP orang lain tidak berubah, itu terjadi karena perubahan sebelumnya tersimpan di dalam memori HP Anda sendiri (Local Storage).
                  <span className="text-[#7B1E3A] block mt-1 font-bold">Tekan tombol sinkronisasi di bawah ini untuk mengunggah semua menu dari HP Anda ke Cloud Database, agar menu di HP orang lain terupdate secara otomatis!</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto min-w-[180px] justify-end">
                {syncSuccess ? (
                  <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-4 py-3 rounded-xl">
                    <Check size={14} />
                    <span>Sinkron Berhasil! ({syncInfo?.menusUploaded} Menu)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCloudSync}
                    disabled={syncing}
                    className="w-full bg-[#7B1E3A] hover:bg-[#7B1E3A]/90 disabled:bg-[#7B1E3A]/50 text-white font-bold text-[10.5px] uppercase tracking-wider py-3 px-5 rounded-xl transition-all shadow-soft duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {syncing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload size={14} />
                        <span>Sinkron Sekarang</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Store Status Override */}
            <div className="bg-white p-4.5 rounded-[20px] border border-cream-dark/30 shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3 rounded-2xl transition-colors duration-300 ${settings?.isOpen !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  <UtensilsCrossed size={22} className={settings?.isOpen !== false ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-gray-800">Status Operasional Toko</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Saat ini toko sedang: <strong className={settings?.isOpen !== false ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {settings?.isOpen !== false ? '🟢 BUKA (Menerima Pesanan)' : '🔴 TUTUP (Pesanan Ditangguhkan)'}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                id="btn-quick-toggle-store"
                onClick={async () => {
                  if (!settings) return;
                  const updated = { ...settings, isOpen: settings.isOpen === false ? true : false };
                  setSettings(updated);
                  await dbService.saveSettings(updated);
                }}
                className={`px-5 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer border self-start sm:self-auto ${
                  settings?.isOpen !== false
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 hover:scale-[1.03] active:scale-[0.97]'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-[1.03] active:scale-[0.97]'
                }`}
              >
                {settings?.isOpen !== false ? '🔴 Tutup Toko Sekarang' : '🟢 Buka Toko Sekarang'}
              </button>
            </div>

            {/* Dashboard Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Pendapatan */}
              <div className="bg-white p-4.5 rounded-[20px] border border-cream-dark/30 shadow-soft flex items-center space-x-4">
                <div className="bg-green-50 text-green-600 p-3 rounded-2xl">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Pendapatan</span>
                  <p className="font-mono text-base font-bold text-gray-800 mt-0.5">
                    <CountUp value={stats.totalRevenue} formatter={formatPrice} />
                  </p>
                </div>
              </div>

              {/* Card 2: Pesanan Baru */}
              <div className="bg-white p-4.5 rounded-[20px] border border-cream-dark/30 shadow-soft flex items-center space-x-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pesanan Baru</span>
                  <p className="font-mono text-xl font-bold text-gray-800 mt-0.5">
                    <CountUp value={stats.newOrdersCount} />
                  </p>
                </div>
              </div>

              {/* Card 3: Total Menu */}
              <div className="bg-white p-4.5 rounded-[20px] border border-cream-dark/30 shadow-soft flex items-center space-x-4">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                  <UtensilsCrossed size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Menu</span>
                  <p className="font-mono text-xl font-bold text-gray-800 mt-0.5">
                    <CountUp value={stats.totalMenuCount} />
                  </p>
                </div>
              </div>

              {/* Card 4: Total Pesanan */}
              <div className="bg-white p-4.5 rounded-[20px] border border-cream-dark/30 shadow-soft flex items-center space-x-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Pesanan</span>
                  <p className="font-mono text-xl font-bold text-gray-800 mt-0.5">
                    <CountUp value={stats.totalOrdersCount} />
                  </p>
                </div>
              </div>
            </div>

            {/* Stock warning status banner */}
            {(stats.outOfStockCount > 0 || stats.lowStockCount > 0) && (
              <div className="bg-white p-5 rounded-[24px] border border-red-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-red-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <h3 className="font-serif font-bold text-sm">Pemberitahuan Persediaan Stok</h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Terdapat <strong className="text-red-600">{stats.outOfStockCount} hidangan habis</strong> dan{' '}
                    <strong className="text-amber-600">{stats.lowStockCount} hidangan dengan stok menipis (≤ 5)</strong>. Segera perbarui persediaan di halaman Kelola Menu.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/menu')}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all cursor-pointer self-start md:self-auto"
                >
                  Kelola Stok Menu
                </button>
              </div>
            )}

            {/* Recent Orders table (5 items max) */}
            <div className="bg-white rounded-[24px] border border-cream-dark/30 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-cream/50 flex items-center justify-between">
                <h3 className="font-serif font-bold text-gray-800">Pesanan Terbaru</h3>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-primary hover:text-primary-dark text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight size={13} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/40 text-[10px] uppercase tracking-wider text-gray-400 font-bold font-sans border-b border-cream/50">
                      <th className="py-4.5 px-6">ID</th>
                      <th className="py-4.5 px-6">Pelanggan</th>
                      <th className="py-4.5 px-6">Tanggal</th>
                      <th className="py-4.5 px-6">Total</th>
                      <th className="py-4.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream/35 text-xs text-gray-600 font-sans">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-cream/15 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-gray-700">{o.id}</td>
                        <td className="py-4 px-6 font-semibold">{o.customerName}</td>
                        <td className="py-4 px-6 text-gray-400">{new Date(o.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="py-4 px-6 font-mono font-bold text-primary">{formatPrice(o.totalAmount)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            o.status === 'Selesai' ? 'bg-green-50 text-green-600 border border-green-200' :
                            o.status === 'Diproses' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                            'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {o.status === 'Pending' ? 'Menunggu' : o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 font-serif italic">Belum ada pesanan masuk hari ini.</td>
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
