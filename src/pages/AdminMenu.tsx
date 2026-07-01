/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { MenuItem, StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminMenu() {
  const navigate = useNavigate();

  // Shared entity state
  const [menus, setMenus] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem('df_cached_menus');
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
      const cached = localStorage.getItem('df_cached_menus');
      return cached ? false : true;
    } catch (e) {
      return true;
    }
  });

  // Modal / Add state for Menu
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Makanan Berat',
    rating: 5,
    image: '',
    bestseller: false,
    available: true,
    dailyQuota: 5,
    stock: 20,
    isAvailable: true
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | Blob | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initial Load (Settings are fetched statically, menus are updated in real-time)
  const loadAllData = async () => {
    try {
      const fetchedSettings = await dbService.getSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    
    loadAllData();
    
    const hasCache = localStorage.getItem('df_cached_menus');
    if (!hasCache) {
      setLoading(true);
    }

    // Fallback timeout to clear loading screen if connection takes too long
    const fallbackTimeout = setTimeout(() => {
      try {
        const cached = localStorage.getItem('df_cached_menus');
        if (cached) {
          setMenus(JSON.parse(cached));
        }
      } catch (e) {}
      setLoading(false);
    }, 3500);

    const unsubscribe = dbService.subscribeMenus((fetchedMenus) => {
      clearTimeout(fallbackTimeout);
      setMenus(fetchedMenus);
      setLoading(false);
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

  const handleOpenMenuModal = (menu: MenuItem | null = null) => {
    setSaving(false);
    setSaveError(null);
    setSelectedImageFile(null);
    if (menu) {
      setSelectedMenu(menu);
      setMenuForm({
        name: menu.name,
        description: menu.description,
        price: menu.price,
        category: menu.category,
        rating: menu.rating,
        image: menu.image,
        bestseller: menu.bestseller,
        available: menu.available,
        dailyQuota: menu.dailyQuota || 5,
        stock: menu.stock !== undefined ? menu.stock : 20,
        isAvailable: menu.isAvailable !== undefined ? menu.isAvailable : (menu.available !== undefined ? menu.available : true)
      });
    } else {
      setSelectedMenu(null);
      setMenuForm({
        name: '',
        description: '',
        price: 0,
        category: 'Makanan Berat',
        rating: 5,
        image: '',
        bestseller: false,
        available: true,
        dailyQuota: 5,
        stock: 20,
        isAvailable: true
      });
    }
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const itemToSave: MenuItem = {
        id: selectedMenu ? selectedMenu.id : '',
        ...menuForm,
        image: menuForm.image,
        // If stock is 0, auto-set available flag for backward compatibility
        available: menuForm.stock > 0 && menuForm.isAvailable
      };

      await dbService.saveMenu(itemToSave);
      setMenuModalOpen(false);
      loadAllData();
    } catch (err: any) {
      console.error("Gagal menyimpan menu:", err);
      setSaveError(err?.message || "Gagal menyimpan menu ke cloud database. Silakan periksa koneksi internet Anda.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteMenu = async (id: string) => {
    if (!id) return;
    try {
      await dbService.deleteMenu(id);
      loadAllData();
    } catch (err) {
      console.error("Gagal menghapus menu:", err);
      alert("Gagal menghapus menu dari cloud database. Silakan periksa koneksi internet Anda.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSaveError("File harus berupa gambar.");
        return;
      }

      setUploadingImage(true);
      setSaveError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if dimension exceeds 800px
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress and convert to Blob so it's ready to upload to Supabase Storage
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  const fileToUpload = new File(
                    [blob], 
                    `menu-${Date.now()}.jpg`, 
                    { type: 'image/jpeg' }
                  );
                  const publicUrl = await dbService.uploadImage(fileToUpload);
                  setMenuForm(prev => ({ ...prev, image: publicUrl }));
                  setSelectedImageFile(null);
                } catch (uploadErr: any) {
                  console.error("Gagal mengupload gambar langsung:", uploadErr);
                  // Use the base64 URL as fallback so it works 100%!
                  const base64Data = canvas.toDataURL('image/jpeg', 0.75);
                  setMenuForm(prev => ({ ...prev, image: base64Data }));
                  setSelectedImageFile(null);
                  setSaveError(`Catatan: Terjadi kendala penyimpanan Supabase (${uploadErr.message || uploadErr}), sistem otomatis mengalihkan ke penyimpanan database (Base64) agar menu Anda tetap tersimpan dengan aman.`);
                }
              } else {
                setSaveError("Gagal memproses/mengompres gambar.");
              }
              setUploadingImage(false);
            }, 'image/jpeg', 0.75);
          } else {
            setUploadingImage(false);
          }
        };
        img.onerror = () => {
          setSaveError("Gagal memproses file gambar.");
          setUploadingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setSaveError("Gagal membaca file.");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

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
                <h2 className="font-serif font-bold text-2xl text-gray-800 font-sans">Manajemen Menu Makanan</h2>
                <p className="text-xs text-gray-400 mt-1">Tambah, edit, hapus, dan atur ketersediaan menu D'Foria Kitchen.</p>
              </div>
              <button
                id="btn-add-menu-item"
                onClick={() => handleOpenMenuModal()}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-3.5 px-6 rounded-xl shadow-soft flex items-center space-x-2 cursor-pointer self-start md:self-auto"
              >
                <Plus size={16} />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            {/* Menu List Table */}
            <div className="bg-white rounded-[24px] border border-cream-dark/30 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/40 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-cream/50">
                      <th className="py-4.5 px-6">Foto</th>
                      <th className="py-4.5 px-6">Nama Menu</th>
                      <th className="py-4.5 px-6">Kategori</th>
                      <th className="py-4.5 px-6">Harga</th>
                      <th className="py-4.5 px-6">Stok</th>
                      <th className="py-4.5 px-6">Bestseller</th>
                      <th className="py-4.5 px-6">Status Toko</th>
                      <th className="py-4.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream/35 text-xs text-gray-600">
                    {menus.map((item) => (
                      <tr key={item.id} className="hover:bg-cream/15 transition-colors">
                        <td className="py-3 px-6">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-cream border border-cream-dark/50" referrerPolicy="no-referrer" />
                        </td>
                        <td className="py-3 px-6">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                        </td>
                        <td className="py-3 px-6 text-gray-500 font-medium">{item.category}</td>
                        <td className="py-3 px-6 font-mono font-bold text-primary">{formatPrice(item.price)}</td>
                        <td className="py-3 px-6 font-mono font-bold text-gray-700">
                          {item.stock !== undefined ? item.stock : 20} porsi
                        </td>
                        <td className="py-3 px-6">
                          {item.bestseller ? (
                            <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">Bestseller</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isAvailable === false
                              ? 'bg-gray-100 text-gray-500 border border-gray-300'
                              : (item.stock === undefined ? 20 : item.stock) <= 0
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-green-50 text-green-600 border border-green-200'
                          }`}>
                            {item.isAvailable === false 
                              ? 'Tutup' 
                              : (item.stock === undefined ? 20 : item.stock) <= 0 
                                ? 'Habis (Out of Stock)' 
                                : 'Buka (Tersedia)'}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              id={`btn-edit-menu-${item.id}`}
                              onClick={() => handleOpenMenuModal(item)}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Menu"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              id={`btn-delete-menu-${item.id}`}
                              onClick={() => handleDeleteMenu(item.id)}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Menu"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {menus.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 font-serif italic">Belum ada menu yang terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Menu Modal */}
            {menuModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
                <div className="bg-white rounded-none sm:rounded-[24px] max-w-4xl w-full h-auto min-h-screen sm:min-h-0 sm:max-h-[calc(100vh-2rem)] flex flex-col shadow-medium border-0 sm:border border-cream-dark/50 relative overflow-visible sm:overflow-hidden">
                  
                  {/* Sticky Header */}
                  <div className="p-5 pb-4 border-b border-cream/50 flex items-center justify-between shrink-0 bg-white">
                    <h3 className="font-serif font-bold text-lg text-primary">
                      {selectedMenu ? 'Ubah Informasi Menu' : 'Tambah Menu Baru'}
                    </h3>
                    <button
                      onClick={() => setMenuModalOpen(false)}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-cream transition-colors cursor-pointer"
                      title="Tutup"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Scrollable Form Body */}
                  <form onSubmit={handleSaveMenu} className="flex-1 flex flex-col justify-between overflow-visible sm:overflow-hidden">
                    <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 text-left text-xs text-gray-600 overflow-visible sm:overflow-y-auto flex-1">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Image, URL & Checkboxes (Col Span 5 for generous preview space) */}
                        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                          {/* Photo preview */}
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Foto Menu</label>
                            <div className="flex flex-row sm:flex-col items-center space-y-0 sm:space-y-4 gap-4 p-3.5 sm:p-5 bg-cream/35 rounded-2xl border border-cream-dark/50 border-dashed w-full">
                              {menuForm.image ? (
                                <div className="relative shrink-0">
                                  <img 
                                    src={menuForm.image} 
                                    alt="Preview" 
                                    className="w-20 h-20 sm:w-[200px] sm:h-[200px] rounded-xl object-cover bg-white shadow-soft" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  {uploadingImage && (
                                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-20 h-20 sm:w-[200px] sm:h-[200px] rounded-xl bg-white flex flex-col items-center justify-center border border-cream-dark/70 text-gray-400 gap-1 sm:gap-2 shrink-0">
                                  {uploadingImage ? (
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <ImageIcon size={24} className="text-gray-300 sm:w-10 sm:h-10" />
                                      <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 text-center px-1">Kosong</span>
                                    </>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
                                <label className={`flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-3 sm:py-3 sm:px-4 rounded-xl transition-all cursor-pointer text-center text-[10px] sm:text-[11px] shadow-sm flex items-center justify-center gap-1.5 ${
                                  uploadingImage ? 'opacity-55 cursor-not-allowed' : ''
                                }`}>
                                  {uploadingImage ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Unggah...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Pilih File</span>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    disabled={uploadingImage} 
                                  />
                                </label>
                                {menuForm.image && (
                                  <button
                                    type="button"
                                    disabled={uploadingImage}
                                    onClick={() => {
                                      setMenuForm(prev => ({ ...prev, image: '' }));
                                      setSelectedImageFile(null);
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-3 sm:px-4 rounded-xl transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Image URL Input */}
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Atau masukkan URL gambar</label>
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={menuForm.image}
                              onChange={(e) => setMenuForm(prev => ({ ...prev, image: e.target.value }))}
                              className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-gray-700"
                            />
                          </div>

                          {/* Checkboxes */}
                          <div className="flex flex-col gap-3 bg-cream/20 p-4.5 rounded-xl border border-cream-dark/20">
                            <label className="flex items-center space-x-3 cursor-pointer font-bold text-gray-700">
                              <input
                                type="checkbox"
                                checked={menuForm.isAvailable}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                                className="rounded accent-primary w-4.5 h-4.5 cursor-pointer"
                              />
                              <span>Buka (Menu Tersedia)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer font-bold text-gray-700">
                              <input
                                type="checkbox"
                                checked={menuForm.bestseller}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, bestseller: e.target.checked }))}
                                className="rounded accent-primary w-4.5 h-4.5 cursor-pointer"
                              />
                              <span>Jadikan Best Seller ⭐</span>
                            </label>
                          </div>
                        </div>

                        {/* Right Column: Name, Price, Category, Stock, Description (Col Span 7 for massive, comfortable inputs) */}
                        <div className="lg:col-span-7 space-y-6">
                          {/* Name Input */}
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-name">Nama Menu</label>
                            <input
                              id="form-menu-name"
                              type="text"
                              required
                              placeholder="Contoh: Nasi Goreng Hijau Spesial"
                              value={menuForm.name}
                              onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-cream/15 px-4 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-sm text-gray-800 font-semibold"
                            />
                          </div>

                          {/* Price & Category Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-price">Harga Jual (Rp)</label>
                              <input
                                id="form-menu-price"
                                type="number"
                                required
                                placeholder="12000"
                                value={menuForm.price}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full bg-cream/15 px-4 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-sm text-gray-800 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-category">Kategori Menu</label>
                              <select
                                id="form-menu-category"
                                value={menuForm.category}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-cream/15 px-4 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-sm text-gray-700 font-semibold cursor-pointer"
                              >
                                <option value="Makanan Berat">Makanan Berat</option>
                                <option value="Minuman">Minuman</option>
                                <option value="Cemilan">Cemilan</option>
                              </select>
                            </div>
                          </div>

                          {/* Stock & Daily Quota Grid */}
                          <div className="grid grid-cols-2 gap-4 bg-cream/10 p-4.5 rounded-xl border border-cream-dark/15">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="form-menu-stock">Sisa Stok (Porsi)</label>
                              <input
                                id="form-menu-stock"
                                type="number"
                                required
                                min="0"
                                placeholder="20"
                                value={menuForm.stock}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                                className="w-full bg-white px-4 py-3 rounded-xl border border-cream-dark/40 focus:outline-none text-sm text-gray-800 font-bold"
                              />
                              <span className="text-[9px] text-gray-400 mt-0.5 block">Jika 0, status otomatis "Habis".</span>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="form-menu-quota">Batas Kuota Harian</label>
                              <input
                                id="form-menu-quota"
                                type="number"
                                value={menuForm.dailyQuota}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, dailyQuota: Number(e.target.value) }))}
                                className="w-full bg-white px-4 py-3 rounded-xl border border-cream-dark/40 focus:outline-none text-sm text-gray-800 font-bold"
                              />
                              <span className="text-[9px] text-gray-400 mt-0.5 block">Batas porsi maksimal per hari.</span>
                            </div>
                          </div>

                          {/* Rating & Description */}
                          <div className="grid grid-cols-1 gap-5">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-rating">Rating Bintang Menu (1-5)</label>
                              <input
                                id="form-menu-rating"
                                type="number"
                                step="0.1"
                                min="1"
                                max="5"
                                placeholder="5"
                                value={menuForm.rating}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                className="w-full bg-cream/15 px-4 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-sm text-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-desc">Deskripsi Rasa & Penyajian</label>
                              <textarea
                                id="form-menu-desc"
                                rows={4}
                                placeholder="Deskripsi lengkap mengenai rasa, cita rasa kuliner, tingkat kepedasan, komposisi utama, atau cara penyajian piring..."
                                value={menuForm.description}
                                onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-cream/15 px-4 py-3.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary text-sm text-gray-700 resize-y leading-relaxed"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Error Banner */}
                      {saveError && (
                        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl font-medium text-[11px] leading-relaxed text-left flex items-start space-x-2.5 animate-fade-in">
                          <span className="text-sm shrink-0">⚠️</span>
                          <span>{saveError}</span>
                        </div>
                      )}

                    </div>

                    {/* Sticky Footer */}
                    <div className="p-5 border-t border-cream/50 justify-end flex space-x-3 shrink-0 bg-cream/10">
                      <button
                        type="button"
                        disabled={saving || uploadingImage}
                        onClick={() => setMenuModalOpen(false)}
                        className={`bg-gray-100 hover:bg-cream text-gray-500 font-bold px-6 py-3 rounded-xl transition-colors text-xs cursor-pointer ${
                          (saving || uploadingImage) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving || uploadingImage}
                        className={`bg-primary hover:bg-primary-dark text-white font-bold px-7 py-3 rounded-xl transition-all text-xs flex items-center space-x-2 cursor-pointer shadow-md ${
                          (saving || uploadingImage) ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {(saving || uploadingImage) && (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{saving ? 'Menyimpan...' : (uploadingImage ? 'Mengunggah Foto...' : 'Simpan Menu')}</span>
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-medium border border-cream-dark/50 text-center">
            <h3 className="font-serif font-bold text-base text-gray-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-xs text-gray-500 mb-6">Apakah Anda yakin ingin menghapus menu makanan ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex space-x-3 justify-center">
              <button
                id="btn-cancel-delete-menu"
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-cream text-gray-500 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-menu"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await executeDeleteMenu(id);
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
