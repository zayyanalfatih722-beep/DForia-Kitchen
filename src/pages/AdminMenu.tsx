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
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);

    const unsubscribe = dbService.subscribeMenus((fetchedMenus) => {
      setMenus(fetchedMenus);
      setLoading(false);
    });

    return () => unsubscribe();
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
    const itemToSave: MenuItem = {
      id: selectedMenu ? selectedMenu.id : '',
      ...menuForm,
      // If stock is 0, auto-set available flag for backward compatibility
      available: menuForm.stock > 0 && menuForm.isAvailable
    };

    await dbService.saveMenu(itemToSave);
    setMenuModalOpen(false);
    loadAllData();
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
              <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
                <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-medium border border-cream-dark/50 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setMenuModalOpen(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
                    title="Tutup"
                  >
                    <X size={18} />
                  </button>

                  <h3 className="font-serif font-bold text-lg text-primary border-b border-cream/50 pb-3 mb-5">
                    {selectedMenu ? 'Ubah Informasi Menu' : 'Tambah Menu Baru'}
                  </h3>

                  <form onSubmit={handleSaveMenu} className="space-y-4.5 text-left text-xs text-gray-600">
                    {/* Photo preview */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Foto Menu</label>
                      <div className="flex flex-col items-center space-y-3 p-4 bg-cream/35 rounded-2xl border border-cream-dark/50 border-dashed">
                        {menuForm.image ? (
                          <img src={menuForm.image} alt="Preview" className="w-36 h-36 rounded-xl object-cover bg-white shadow-soft" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-36 h-36 rounded-xl bg-white flex items-center justify-center border text-gray-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="flex space-x-2 w-full">
                          <label className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center">
                            Upload dari Galeri
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                          {menuForm.image && (
                            <button
                              type="button"
                              onClick={() => setMenuForm(prev => ({ ...prev, image: '' }))}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 rounded-xl transition-colors cursor-pointer"
                            >
                              Hapus Foto
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
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-name">Nama Menu</label>
                      <input
                        id="form-menu-name"
                        type="text"
                        required
                        placeholder="Contoh: Nasi Goreng Hijau"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-price">Harga (Rp)</label>
                      <input
                        id="form-menu-price"
                        type="number"
                        required
                        placeholder="Contoh: 12000"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-category">Kategori</label>
                      <select
                        id="form-menu-category"
                        value={menuForm.category}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                      >
                        <option value="Makanan Berat">Makanan Berat</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Cemilan">Cemilan</option>
                      </select>
                    </div>

                    {/* Rating (1-5) */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-rating">Rating (1-5)</label>
                      <input
                        id="form-menu-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        placeholder="5"
                        value={menuForm.rating}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    {/* Stock Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="form-menu-stock">Stok Porsi</label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="form-menu-stock"
                          type="number"
                          required
                          min="0"
                          placeholder="Contoh: 20"
                          value={menuForm.stock}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-24 bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-400">Jumlah porsi sisa. Jika 0, status otomatis "Habis".</span>
                      </div>
                    </div>

                    {/* Daily Quota */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="form-menu-quota">Kuota Harian (Porsi)</label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="form-menu-quota"
                          type="number"
                          value={menuForm.dailyQuota}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, dailyQuota: Number(e.target.value) }))}
                          className="w-20 bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-400 font-sans">Batas kuota harian.</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="form-menu-desc">Deskripsi</label>
                      <textarea
                        id="form-menu-desc"
                        rows={3}
                        placeholder="Masukkan deskripsi rasa menu..."
                        value={menuForm.description}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-cream/15 px-3 py-2.5 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary resize-none"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex space-x-6 bg-cream/20 p-3 rounded-xl border border-cream-dark/20">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={menuForm.isAvailable}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                          className="rounded accent-primary"
                        />
                        <span>Buka (Tersedia)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={menuForm.bestseller}
                          onChange={(e) => setMenuForm(prev => ({ ...prev, bestseller: e.target.checked }))}
                          className="rounded accent-primary"
                        />
                        <span>Jadikan Best Seller</span>
                      </label>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex space-x-2 pt-4 border-t border-cream/50 justify-end">
                      <button
                        type="button"
                        onClick={() => setMenuModalOpen(false)}
                        className="bg-gray-100 hover:bg-cream text-gray-500 font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Simpan Menu
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
