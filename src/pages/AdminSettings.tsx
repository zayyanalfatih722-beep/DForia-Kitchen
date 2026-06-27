/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Lock,
  Globe,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { StoreSettings } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminSettings() {
  const navigate = useNavigate();

  // Shared entity state
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Settings states
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    storeName: '',
    address: '',
    phone: '',
    whatsapp: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    openingHour: '08:00',
    closingHour: '22:00',
    isOpen: true,
    mapsUrl: '',
    locationCity: '',
    locationProvince: ''
  });

  // Password states
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Feedback states
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedSettings = await dbService.getSettings();
      setSettings(fetchedSettings);
      setSettingsForm({
        storeName: fetchedSettings.storeName || '',
        address: fetchedSettings.address || '',
        phone: fetchedSettings.phone || '',
        whatsapp: fetchedSettings.whatsapp || '',
        bankName: fetchedSettings.bankName || '',
        bankAccountNumber: fetchedSettings.bankAccountNumber || '',
        bankAccountHolder: fetchedSettings.bankAccountHolder || '',
        openingHour: fetchedSettings.openingHour || '08:00',
        closingHour: fetchedSettings.closingHour || '22:00',
        isOpen: fetchedSettings.isOpen !== undefined ? fetchedSettings.isOpen : true,
        mapsUrl: fetchedSettings.mapsUrl || '',
        locationCity: fetchedSettings.locationCity || '',
        locationProvince: fetchedSettings.locationProvince || ''
      });
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveLoading(true);
    try {
      await dbService.saveSettings(settingsForm);
      setSettings(settingsForm);
      setSaveStatus({ type: 'success', message: "Profil D'Foria Kitchen berhasil diperbarui!" });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setSaveStatus({ 
        type: 'error', 
        message: "Gagal menyimpan pengaturan: " + (err instanceof Error ? err.message : String(err)) 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!passwordForm.newPassword) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi baru tidak boleh kosong.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi baru minimal harus 6 karakter.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await dbService.changeAdminPassword(passwordForm.newPassword);
      setPasswordStatus({ type: 'success', message: 'Kata sandi admin berhasil diperbarui!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setPasswordStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setPasswordStatus({ 
        type: 'error', 
        message: "Gagal mengganti kata sandi: " + (err instanceof Error ? err.message : String(err)) 
      });
    } finally {
      setPasswordLoading(false);
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
              <h2 className="font-serif font-bold text-2xl text-gray-800">Pengaturan D'Foria Kitchen</h2>
              <p className="text-xs text-gray-400 mt-1">Ubah nama, alamat lengkap, nomor kontak, serta kata sandi panel kontrol restoran Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Store Profile Settings (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50">Profil Toko / Cabang</h3>
                  
                  {saveStatus && (
                    <div className={`mb-5 p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                      saveStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {saveStatus.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="flex-1 font-medium">{saveStatus.message}</div>
                      <button 
                        onClick={() => setSaveStatus(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4.5 text-xs text-gray-600">
                    {/* Manual Store Open/Close Toggle */}
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-serif font-bold text-xs text-amber-950 uppercase tracking-wide">Status Manual Toko</h3>
                        <p className="text-[10px] text-amber-800/80 mt-0.5 font-medium">Buka atau tutup toko secara paksa (override) untuk pelanggan.</p>
                      </div>
                      <button
                        id="btn-toggle-store-status"
                        type="button"
                        onClick={() => setSettingsForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                        className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer border ${
                          settingsForm.isOpen
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-105 active:scale-95'
                            : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {settingsForm.isOpen ? '🟢 Buka' : '🔴 Tutup'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-name">Nama Toko / Restoran</label>
                      <input
                        id="set-store-name"
                        type="text"
                        required
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-address">Alamat Lengkap Cabang</label>
                      <textarea
                        id="set-store-address"
                        rows={3}
                        required
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-phone">Nomor Telepon Kantor</label>
                      <input
                        id="set-store-phone"
                        type="text"
                        required
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-store-wa">Nomor WhatsApp Pelanggan (Format Internasional: 628...)</label>
                      <input
                        id="set-store-wa"
                        type="text"
                        required
                        placeholder="Contoh: 628123456789"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Rekening Pembayaran Bank</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-name">Nama Bank</label>
                          <input
                            id="set-bank-name"
                            type="text"
                            placeholder="Contoh: Bank Central Asia (BCA)"
                            value={settingsForm.bankName}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankName: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-acc">Nomor Rekening</label>
                          <input
                            id="set-bank-acc"
                            type="text"
                            placeholder="Contoh: 8420994981"
                            value={settingsForm.bankAccountNumber}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-bank-holder">Nama Pemilik Rekening</label>
                          <input
                            id="set-bank-holder"
                            type="text"
                            placeholder="Contoh: D'Foria Kitchen Indonesia"
                            value={settingsForm.bankAccountHolder}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, bankAccountHolder: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Jam Operasional Toko</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-opening-hour">Jam Buka</label>
                          <input
                            id="set-opening-hour"
                            type="text"
                            placeholder="Contoh: 08:00"
                            required
                            value={settingsForm.openingHour || '08:00'}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, openingHour: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-closing-hour">Jam Tutup</label>
                          <input
                            id="set-closing-hour"
                            type="text"
                            placeholder="Contoh: 22:00"
                            required
                            value={settingsForm.closingHour || '22:00'}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, closingHour: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-center"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 leading-normal">
                        Format waktu menggunakan format 24 jam (JJ:MM), misal: 08:00 s.d 22:00. Status buka/tutup toko di halaman utama akan disesuaikan secara otomatis berdasarkan jam operasional ini.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-cream/50">
                      <h3 className="font-serif font-bold text-sm text-primary mb-3">Informasi Lokasi & Peta (Google Maps)</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-location-city">Nama Kota / Pulau / Wilayah</label>
                          <input
                            id="set-location-city"
                            type="text"
                            placeholder="Contoh: Pulau Weh - Kota Sabang"
                            value={settingsForm.locationCity || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, locationCity: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-location-province">Provinsi / Negara</label>
                          <input
                            id="set-location-province"
                            type="text"
                            placeholder="Contoh: Aceh, Indonesia"
                            value={settingsForm.locationProvince || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, locationProvince: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-maps-url">Link Peta Google Maps (Pencarian / Pin Lokasi)</label>
                          <input
                            id="set-maps-url"
                            type="text"
                            placeholder="Contoh: https://www.google.com/maps/search/?api=1&query=..."
                            value={settingsForm.mapsUrl || ''}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mapsUrl: e.target.value }))}
                            className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-[11px]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                            Masukkan tautan/URL Google Maps agar pelanggan dapat mengeklik tombol "Lihat di Maps" di halaman depan untuk langsung menavigasi ke restoran Anda.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        id="btn-save-settings-submit"
                        type="submit"
                        disabled={saveLoading}
                        className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {saveLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Perbarui Profil Toko</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Security/Password & System Info (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Mode status block */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <Database size={16} className="text-primary" />
                    <span>Mode Penyimpanan Data</span>
                  </h3>
                  
                  {dbService.isCloudMode() ? (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 space-y-2 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Globe size={16} className="text-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Mode Cloud Terhubung</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                        Aplikasi Anda saat ini terhubung langsung ke Google Firebase Firestore & Auth. Semua perubahan disimpan di cloud secara persisten.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/50 space-y-2 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Database size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Mode Sandbox Lokal</span>
                      </div>
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                        Tidak ada konfigurasi Firebase terdeteksi. Aplikasi berjalan dalam mode sandbox lokal. Semua data disimpan secara aman di penyimpanan web (localStorage) browser Anda.
                      </p>
                    </div>
                  )}
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-[24px] p-6 border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-base text-gray-800 mb-4 pb-2 border-b border-cream/50 flex items-center space-x-2">
                    <Lock size={16} className="text-primary" />
                    <span>Ubah Kata Sandi Admin</span>
                  </h3>

                  {passwordStatus && (
                    <div className={`mb-5 p-4 rounded-xl border flex items-start space-x-3 text-xs transition-all animate-fade-in ${
                      passwordStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="flex-1 font-medium">{passwordStatus.message}</div>
                      <button 
                        onClick={() => setPasswordStatus(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 text-xs text-gray-600">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-new-password">Kata Sandi Baru</label>
                      <div className="relative">
                        <input
                          id="set-new-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Masukkan kata sandi baru"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-cream/15 pl-3.5 pr-10 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="set-confirm-password">Konfirmasi Kata Sandi Baru</label>
                      <input
                        id="set-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Ulangi kata sandi baru"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-cream/15 px-3.5 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal">
                      Sandi baru minimal terdiri dari 6 karakter. Setelah diperbarui, kata sandi baru langsung aktif untuk masuk ke panel admin ini.
                    </p>

                    <div className="pt-2">
                      <button
                        id="btn-save-password-submit"
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {passwordLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Perbarui Kata Sandi</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
