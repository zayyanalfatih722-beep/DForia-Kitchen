import React, { useEffect, useState } from 'react';
import { AlertTriangle, Database, RefreshCw, X } from 'lucide-react';
import { addQuotaListener, dbService } from '../lib/firebase';

export default function QuotaWarningBanner() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = addQuotaListener((exceeded) => {
      setQuotaExceeded(exceeded);
    });
    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('idle');
    try {
      const res = await dbService.syncLocalToCloud();
      if (res.success) {
        setSyncStatus('success');
        // If sync succeeded, maybe the quota error is gone or we flushed the cache.
        // We can wait a moment and dismiss/reset.
        setTimeout(() => {
          setSyncStatus('idle');
        }, 4000);
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  if (!quotaExceeded || dismissed) return null;

  const isAdmin = window.location.pathname.startsWith('/admin');

  return (
    <div id="quota-warning-banner" className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 shadow-sm relative animate-fade-in z-50">
      <div className="max-w-md mx-auto flex items-start space-x-3 pr-8">
        <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle size={16} className="animate-pulse" />
        </div>
        <div className="flex-1 text-xs leading-relaxed">
          <h4 className="font-bold text-amber-800 flex items-center space-x-1.5">
            <span>Batas Cloud Firestore Terlampaui</span>
            <span className="bg-amber-200/60 text-amber-800 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-normal">Offline Sandbox</span>
          </h4>
          <p className="mt-0.5 text-[11px] text-amber-700">
            Batas kuota gratis harian Firebase untuk proyek ini telah tercapai. Aplikasi otomatis berjalan dalam <strong>Mode Lokal Offline</strong>. Semua menu, pesanan, dan keuangan Anda 100% aman tersimpan di perangkat ini.
          </p>

          {isAdmin && (
            <div className="mt-2.5 flex items-center space-x-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-55"
              >
                <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Data ke Cloud'}</span>
              </button>
              
              {syncStatus === 'success' && (
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
                  <span>✓ Berhasil disinkronkan!</span>
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="text-[10px] font-semibold text-red-500">
                  ⚠️ Gagal: Kuota Firebase masih penuh.
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2.5 top-3 text-amber-500 hover:text-amber-800 transition-colors p-1"
          aria-label="Tutup"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
