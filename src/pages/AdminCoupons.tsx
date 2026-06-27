/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Trash2 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Coupon, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminCoupons() {
  const navigate = useNavigate();

  // Shared entity state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Coupon Form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    active: true
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedCoupons = await dbService.getCoupons();
      const fetchedSettings = await dbService.getSettings();

      setCoupons(fetchedCoupons);
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

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    const newCoupon: Coupon = {
      id: '',
      code: couponForm.code.trim().toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: couponForm.discountValue,
      active: couponForm.active
    };

    await dbService.saveCoupon(newCoupon);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      active: true
    });
    loadAllData();
  };

  const handleDeleteCoupon = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteCoupon = async (id: string) => {
    if (!id) return;
    try {
      await dbService.deleteCoupon(id);
      loadAllData();
    } catch (err) {
      console.error("Gagal menghapus kupon:", err);
      alert("Gagal menghapus kupon dari cloud database. Silakan periksa koneksi internet Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Top Admin Header */}
      <AdminHeader />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
              <h2 className="font-serif font-bold text-2xl text-gray-800 font-sans">Manajemen Kupon Diskon</h2>
              <p className="text-xs text-gray-400 mt-1">Buat kode kupon diskon persentase atau potongan harga nominal langsung untuk pelanggan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create coupon form */}
              <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft h-fit">
                <h3 className="font-serif font-bold text-gray-800 border-b pb-2 mb-4 text-sm">Buat Kupon Baru</h3>
                <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs text-gray-600">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="coupon-code-form">Kode Kupon (Huruf Besar)</label>
                    <input
                      id="coupon-code-form"
                      type="text"
                      required
                      placeholder="Contoh: MERDEKA45"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full bg-cream/15 px-3.5 py-2.5 rounded-xl border border-cream-dark/45 font-mono font-bold text-sm text-primary uppercase focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="coupon-type-form">Jenis Diskon</label>
                    <select
                      id="coupon-type-form"
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                      className="w-full bg-cream/15 px-3.5 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal Potongan (Rp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="coupon-val-form">Nilai Diskon</label>
                    <input
                      id="coupon-val-form"
                      type="number"
                      required
                      placeholder="Contoh: 10 atau 5000"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                      className="w-full bg-cream/15 px-3.5 py-2.5 rounded-xl border border-cream-dark/45 font-mono focus:outline-none"
                    />
                  </div>

                  <button
                    id="btn-save-coupon-submit"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow transition-all cursor-pointer text-center"
                  >
                    Simpan Kupon Baru
                  </button>
                </form>
              </div>

              {/* Coupon List */}
              <div className="lg:col-span-2 bg-white rounded-[24px] border border-cream-dark/30 shadow-soft overflow-hidden h-fit">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream/40 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b">
                      <th className="py-4 px-6">Kode Kupon</th>
                      <th className="py-4 px-6">Besar Potongan</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream/35 text-gray-600">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-cream/15 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-gray-800 uppercase tracking-wider text-sm">{c.code}</td>
                        <td className="py-3.5 px-6 font-semibold">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600'
                          }`}>
                            {c.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            id={`btn-delete-coupon-${c.id}`}
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg cursor-pointer"
                            title="Hapus Kupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400 font-serif italic">Belum ada kupon diskon terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-medium border border-cream-dark/50 text-center">
            <h3 className="font-serif font-bold text-base text-gray-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-xs text-gray-500 mb-6">Apakah Anda yakin ingin menghapus kupon diskon ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex space-x-3 justify-center">
              <button
                id="btn-cancel-delete-coupon"
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-cream text-gray-500 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-coupon"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await executeDeleteCoupon(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
