/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Lock, User, AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { dbService } from '../lib/firebase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem('df_saved_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('df_saved_password') || '');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('df_remember_me') !== 'false');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoverySuccess(false);
    setLoading(true);

    try {
      const success = await dbService.loginAdmin(username, password);
      if (success) {
        // Save or remove credentials based on rememberMe option
        if (rememberMe) {
          localStorage.setItem('df_saved_username', username);
          localStorage.setItem('df_saved_password', password);
          localStorage.setItem('df_remember_me', 'true');
        } else {
          localStorage.removeItem('df_saved_username');
          localStorage.removeItem('df_saved_password');
          localStorage.setItem('df_remember_me', 'false');
        }

        // Request notification permission from admin on successful login
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch (err) {
            console.warn("Failed to request notification permission:", err);
          }
        }
        navigate('/admin/dashboard');
      } else {
        setError('Username atau password yang Anda masukkan salah.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await dbService.changeAdminUsername('admin');
      await dbService.changeAdminPassword('admin123');
    } catch (err) {
      console.warn("Failed to reset credentials on Firestore, resetting locally:", err);
    }

    // Reset local fallback credentials
    localStorage.setItem('df_admin_username', 'admin');
    localStorage.setItem('df_admin_password', 'admin123');
    
    // Auto-populate form
    setUsername('admin');
    setPassword('admin123');
    
    setError('');
    setRecoverySuccess(true);
    setIsRecoveryMode(false);
  };

  if (isRecoveryMode) {
    return (
      <div id="admin-login-page" className="min-h-[100dvh] h-auto bg-cream flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-white rounded-[24px] p-8 shadow-medium border border-cream-dark/50 text-center">
          {/* Round logo circle */}
          <div className="bg-primary/10 text-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 shadow-soft">
            <Lock size={24} />
          </div>

          {/* Title */}
          <h1 className="font-serif text-xl font-bold text-primary mb-1">Pemulihan Akun</h1>
          <p className="text-xs text-gray-400 mb-6 font-medium">Reset password ke setelan bawaan</p>

          <div className="bg-amber-50 text-amber-700 text-xs p-4 rounded-xl border border-amber-200/50 text-left mb-6 space-y-2 leading-relaxed">
            <p className="font-semibold">Apakah Anda lupa password lama Anda?</p>
            <p className="text-[11px] text-amber-700/90">
              Anda dapat mengatur ulang kata sandi admin Anda kembali ke bawaan pabrik:
            </p>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/50 font-mono text-xs text-amber-800 space-y-0.5">
              <div>• Username: <strong>admin</strong></div>
              <div>• Password: <strong>admin123</strong></div>
            </div>
            <p className="text-[10px] text-amber-600/80 italic">
              *Setelah masuk, Anda bisa mengubahnya kembali lewat menu Pengaturan Admin.
            </p>
          </div>

          <div className="space-y-3">
            <button
              id="btn-confirm-reset"
              type="button"
              onClick={handleResetPassword}
              className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-3.5 rounded-xl shadow-soft transition-all cursor-pointer"
            >
              Setel Ulang ke Password Bawaan
            </button>

            <button
              id="btn-cancel-reset"
              type="button"
              onClick={() => setIsRecoveryMode(false)}
              className="w-full bg-cream hover:bg-cream-dark/30 text-primary border border-cream-dark/60 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              Batal & Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-login-page" className="min-h-[100dvh] h-auto bg-cream flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[24px] p-8 shadow-medium border border-cream-dark/50 text-center">
        {/* Round logo circle */}
        <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Utensils size={24} />
        </div>

        {/* Title */}
        <h1 className="font-serif text-xl font-bold text-primary mb-1">D'Foria Admin</h1>
        <p className="text-xs text-gray-400 mb-6 font-medium">Masuk ke panel kontrol</p>

        {recoverySuccess && (
          <div id="recovery-success-badge" className="bg-emerald-50 text-emerald-600 text-xs px-3.5 py-3 rounded-xl border border-emerald-200/50 flex flex-col text-left mb-5">
            <div className="flex items-center space-x-2 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Sandi Berhasil Direset!</span>
            </div>
            <p className="text-[11px] text-emerald-600/90 leading-relaxed font-medium">
              Username & Password disetel kembali ke bawaan: <br/>
              <strong>admin</strong> / <strong>admin123</strong>. <br/>
              Kolom isian sudah otomatis terisi, silakan klik tombol <strong>Masuk</strong>.
            </p>
          </div>
        )}

        {error && (
          <div id="login-error-badge" className="bg-red-50 text-red-600 text-xs px-3.5 py-3 rounded-xl border border-red-200/50 flex items-center space-x-2 text-left mb-5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4.5 text-left">
          {/* Username Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="login-username">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <User size={15} />
              </span>
              <input
                id="login-username"
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cream/20 text-gray-700 placeholder-gray-400 text-xs pl-10 pr-3 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                type="password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream/20 text-gray-700 placeholder-gray-400 text-xs pl-10 pr-3 py-3 rounded-xl border border-cream-dark/45 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-1 pb-1">
            <input
              id="remember-me-checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-cream-dark/45 text-primary focus:ring-primary/40 accent-primary cursor-pointer"
            />
            <label htmlFor="remember-me-checkbox" className="text-xs text-gray-500 font-medium select-none cursor-pointer ml-2">
              Simpan sandi di HP ini
            </label>
          </div>

          <button
            id="btn-admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white text-xs font-semibold py-3.5 rounded-xl shadow-soft transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Masuk'
            )}
          </button>

          {/* Lupa Password - Highly Visible Center Link */}
          <div className="text-center pt-2.5 pb-1">
            <button
              type="button"
              onClick={() => setIsRecoveryMode(true)}
              className="text-xs text-primary hover:text-primary-dark font-bold hover:underline cursor-pointer flex items-center justify-center mx-auto space-x-1.5 py-1.5 transition-colors"
            >
              <HelpCircle size={14} className="text-primary" />
              <span>Lupa password admin Anda?</span>
            </button>
          </div>

          <button
            id="btn-back-to-store"
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-2 bg-cream hover:bg-cream-dark/30 text-primary border border-cream-dark/60 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Toko</span>
          </button>
        </form>
      </div>
    </div>
  );
}
