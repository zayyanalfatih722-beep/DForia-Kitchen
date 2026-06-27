/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  X
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Banner, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminBanner() {
  const navigate = useNavigate();

  // Shared entity state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Banner states
  const [bannerUrl, setBannerUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension to keep document size light and efficient
          const MAX_WIDTH = 1000;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = () => {
          reject(new Error("Gagal membaca berkas gambar."));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Gagal membaca file dari penyimpanan."));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const compressedBase64 = await resizeAndCompressImage(file);
      setBannerUrl(compressedBase64);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Gagal mengompresi gambar");
    } finally {
      setIsUploading(false);
    }
  };

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedBanners = await dbService.getBanners();
      const fetchedSettings = await dbService.getSettings();

      setBanners(fetchedBanners);
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

  const handleAddBanner = async () => {
    if (!bannerUrl.trim()) return;
    const newBanner: Banner = {
      id: '',
      imageUrl: bannerUrl,
      order: banners.length + 1
    };
    await dbService.saveBanner(newBanner);
    setBannerUrl('');
    loadAllData();
  };

  const handleDeleteBanner = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteBanner = async (id: string) => {
    if (!id) return;
    try {
      await dbService.deleteBanner(id);
      loadAllData();
    } catch (err) {
      console.error("Gagal menghapus banner:", err);
      alert("Gagal menghapus banner dari cloud database. Silakan periksa koneksi internet Anda.");
    }
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const list = [...banners];
    const tempOrder = list[index].order;
    list[index].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;

    // Save both
    await dbService.saveBanner(list[index]);
    await dbService.saveBanner(list[targetIdx]);
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Top Admin Navigation Header */}
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
              <h2 className="font-serif font-bold text-2xl text-gray-800">Manajemen Banner Promo</h2>
              <p className="text-xs text-gray-400 mt-1">Kelola slide promosi utama yang tampil pada halaman depan pelanggan.</p>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-gray-800 text-sm">Tambah Banner Baru</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Upload from Gallery area */}
                <div className="flex flex-col justify-center items-center border-2 border-dashed border-cream-dark/50 rounded-2xl p-6 bg-cream/5 hover:bg-cream/15 transition-all text-center relative group">
                  <input
                    id="banner-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-gray-500">Memproses gambar...</span>
                    </div>
                  ) : bannerUrl && bannerUrl.startsWith('data:image') ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-soft z-30">
                      <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setBannerUrl('');
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition-colors cursor-pointer z-40"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Pilih dari Galeri Foto</p>
                        <p className="text-[10px] text-gray-400 mt-1">Saran ukuran: 1200 x 500 px</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Alternatively paste URL */}
                <div className="flex flex-col justify-center space-y-3 p-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center space-x-1">
                    <ImageIcon size={11} />
                    <span>Atau gunakan URL Gambar Eksternal</span>
                  </label>
                  <input
                    id="banner-url-input"
                    type="text"
                    placeholder="Masukkan URL foto banner (misal: Unsplash)"
                    value={bannerUrl.startsWith('data:image') ? '' : bannerUrl}
                    onChange={(e) => {
                      setUploadError(null);
                      setBannerUrl(e.target.value);
                    }}
                    className="w-full bg-cream/20 px-3.5 py-3 rounded-xl border border-cream-dark/45 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">
                    Unggah langsung dari galeri lokal Anda, atau tempel tautan gambar Unsplash/Pinterest jika lebih menyukai foto eksternal.
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="flex items-center space-x-1.5 text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 animate-fade-in">
                  <AlertCircle size={13} />
                  <span>{uploadError}</span>
                </div>
              )}

              {bannerUrl && (
                <div className="flex justify-end pt-2 border-t border-cream/50 animate-fade-in">
                  <button
                    onClick={handleAddBanner}
                    className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-soft hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Simpan & Publikasikan Banner
                  </button>
                </div>
              )}
            </div>

            {/* Banner list card matching screenshots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b, idx) => (
                <div key={b.id} className="bg-white rounded-3xl overflow-hidden border border-cream-dark/30 shadow-soft relative group">
                  <img src={b.imageUrl} alt={`Banner ${b.order}`} className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
                  
                  {/* Bottom info & persistent action bar for touch/mobile devices */}
                  <div className="p-3.5 bg-white border-t flex flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700 font-mono">Urutan #{b.order}</span>
                      <span className="text-[9px] text-gray-400">ID: {b.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        id={`btn-move-up-banner-${b.id}`}
                        disabled={idx === 0}
                        onClick={() => handleMoveBanner(idx, 'up')}
                        className="bg-cream/40 text-gray-700 hover:text-primary p-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                        title="Geser Kiri"
                      >
                        ←
                      </button>
                      <button
                        id={`btn-move-down-banner-${b.id}`}
                        disabled={idx === banners.length - 1}
                        onClick={() => handleMoveBanner(idx, 'down')}
                        className="bg-cream/40 text-gray-700 hover:text-primary p-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                        title="Geser Kanan"
                      >
                        →
                      </button>
                      <button
                        id={`btn-delete-banner-action-${b.id}`}
                        onClick={() => handleDeleteBanner(b.id)}
                        className="bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                        title="Hapus Banner"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400 font-serif italic">Belum ada banner promo.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-medium border border-cream-dark/50 text-center">
            <h3 className="font-serif font-bold text-base text-gray-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-xs text-gray-500 mb-6">Apakah Anda yakin ingin menghapus banner promo ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex space-x-3 justify-center">
              <button
                id="btn-cancel-delete-banner"
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-cream text-gray-500 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-banner"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await executeDeleteBanner(id);
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
