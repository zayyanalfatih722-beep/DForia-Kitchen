/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Calculator, 
  ArrowDownCircle, 
  ArrowUpCircle 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Order, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminFinance() {
  const navigate = useNavigate();

  // Shared entity state
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Operational cost simulations
  const [bahanBakuCost, setBahanBakuCost] = useState(150000);
  const [operasionalCost, setOperasionalCost] = useState(50000);

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await dbService.getOrders();
      const fetchedSettings = await dbService.getSettings();

      setOrders(fetchedOrders);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Finance metrics
  const completedOrders = orders.filter(o => o.status === 'Selesai');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const qrisRevenue = completedOrders
    .filter(o => o.paymentMethod === 'QRIS')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const cashRevenue = completedOrders
    .filter(o => o.paymentMethod !== 'QRIS')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCost = bahanBakuCost + operasionalCost;
  const netProfit = totalRevenue - totalCost;

  return (
    <div className="min-h-[100dvh] h-auto bg-cream pb-12">
      {/* Top Admin Header */}
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
            <div>
              <h2 className="font-serif font-bold text-2xl text-gray-800">Buku Keuangan & Profitabilitas</h2>
              <p className="text-xs text-gray-400 mt-1">Pantau laba kotor, laba bersih, rincian biaya operasional, dan metode kas masuk.</p>
            </div>

            {/* Income Ledger Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-cream-dark/30 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Pendapatan Kotor</span>
                  <div className="bg-green-50 text-green-600 p-2 rounded-xl">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <p className="font-mono text-2xl font-bold text-green-600 mt-2">
                  {formatPrice(totalRevenue)}
                </p>
                <span className="text-[10px] text-gray-400 mt-1.5 block">Akumulasi seluruh transaksi sukses.</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-cream-dark/30 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Metode Pembayaran QRIS</span>
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                    <CreditCard size={16} />
                  </div>
                </div>
                <p className="font-mono text-xl font-bold text-blue-600 mt-2">
                  {formatPrice(qrisRevenue)}
                </p>
                <span className="text-[10px] text-gray-400 mt-1.5 block">Dana masuk lewat scan e-wallet QRIS.</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-cream-dark/30 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pembayaran Tunai / Cash</span>
                  <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
                    <DollarSign size={16} />
                  </div>
                </div>
                <p className="font-mono text-xl font-bold text-amber-600 mt-2">
                  {formatPrice(cashRevenue)}
                </p>
                <span className="text-[10px] text-gray-400 mt-1.5 block">Penerimaan kas fisik dari meja/kasir.</span>
              </div>
            </div>

            {/* Income vs Expenses Calculator (Net Profit Statement) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ledger Costs Inputs */}
              <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-4">
                <h3 className="font-serif font-bold text-gray-800 text-sm border-b pb-2 flex items-center space-x-2">
                  <Calculator size={15} className="text-primary" />
                  <span>Input Biaya Operasional</span>
                </h3>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Biaya Bahan Baku (COGS)</label>
                    <input
                      type="number"
                      value={bahanBakuCost}
                      onChange={(e) => setBahanBakuCost(Number(e.target.value))}
                      className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sewa, Gaji, & Listrik</label>
                    <input
                      type="number"
                      value={operasionalCost}
                      onChange={(e) => setOperasionalCost(Number(e.target.value))}
                      className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Net Profit Display */}
              <div className="lg:col-span-2 bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft">
                <h3 className="font-serif font-bold text-gray-800 text-sm border-b pb-2">Laporan Laba Rugi Sederhana</h3>
                
                <div className="mt-4 space-y-4 text-xs text-gray-600">
                  <div className="flex justify-between items-center bg-green-50/50 p-3 rounded-xl border border-green-100">
                    <span className="flex items-center space-x-2 font-bold text-green-700">
                      <ArrowUpCircle size={16} />
                      <span>Total Omzet Pendapatan</span>
                    </span>
                    <span className="font-mono font-bold text-green-700">{formatPrice(totalRevenue)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100">
                    <span className="flex items-center space-x-2 font-bold text-red-700">
                      <ArrowDownCircle size={16} />
                      <span>Total Biaya Operasional</span>
                    </span>
                    <span className="font-mono font-bold text-red-700">-{formatPrice(totalCost)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/25">
                    <span className="font-serif font-bold text-sm text-primary">Proyeksi Laba Bersih (Net Profit)</span>
                    <span className="font-mono font-extrabold text-lg text-primary">{formatPrice(netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Transaction List */}
            <div className="bg-white rounded-[24px] border border-cream-dark/30 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-cream/50">
                <h3 className="font-serif font-bold text-gray-800">Arsip Penerimaan Kas Selesai</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/40 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-cream/50">
                      <th className="py-4.5 px-6">ID Transaksi</th>
                      <th className="py-4.5 px-6">Pelanggan</th>
                      <th className="py-4.5 px-6">Metode</th>
                      <th className="py-4.5 px-6">Waktu Selesai</th>
                      <th className="py-4.5 px-6">Jumlah Bersih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream/35 text-xs text-gray-600">
                    {completedOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-cream/15 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-gray-700">{o.id}</td>
                        <td className="py-4 px-6 font-semibold">{o.customerName}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.paymentMethod === 'QRIS' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400">{new Date(o.createdAt).toLocaleString('id-ID')}</td>
                        <td className="py-4 px-6 font-mono font-bold text-green-600">{formatPrice(o.totalAmount)}</td>
                      </tr>
                    ))}
                    {completedOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 font-serif italic">Belum ada transaksi selesai hari ini.</td>
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
