/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { dbService } from '../lib/firebase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem('df_saved_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('df_saved_password') || '');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('df_remember_me') !== 'false');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

  return (
    <div id="admin-login-page" className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[24px] p-8 shadow-medium border border-cream-dark/50 text-center">
        {/* Round logo circle */}
        <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Utensils size={24} />
        </div>

        {/* Title */}
        <h1 className="font-serif text-xl font-bold text-primary mb-1">D'Foria Admin</h1>
        <p className="text-xs text-gray-400 mb-6 font-medium">Masuk ke panel kontrol</p>

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

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2 pt-1 pb-2">
            <input
              id="remember-me-checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-cream-dark/45 text-primary focus:ring-primary/40 accent-primary cursor-pointer"
            />
            <label htmlFor="remember-me-checkbox" className="text-xs text-gray-500 font-medium select-none cursor-pointer">
              Simpan password di HP ini
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

          <button
            id="btn-back-to-store"
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-3 bg-cream hover:bg-cream-dark/30 text-primary border border-cream-dark/60 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Toko</span>
          </button>
        </form>
      </div>
    </div>
  );
}
