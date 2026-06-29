import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Smartphone, ArrowDown } from 'lucide-react';

// Keep track of the install prompt event globally to share between components
let globalDeferredPrompt: any = null;
const listeners = new Set<(e: any) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((listener) => listener(e));
  });
}

export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(!!globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone || 
        document.referrer.includes('android-app://');
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();

    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent) && !/chrome|crios|fxios|opr/.test(userAgent);
      setIsIOS(isApple);
    };
    checkIOS();

    const updatePrompt = (e: any) => {
      setIsInstallable(true);
    };

    listeners.add(updatePrompt);
    return () => {
      listeners.delete(updatePrompt);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (globalDeferredPrompt) {
      globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
        setIsInstallable(false);
        return true;
      }
    }
    return false;
  };

  return {
    isInstallable: (isInstallable || isIOS) && !isStandalone,
    isStandalone,
    isIOS: isIOS && !isStandalone,
    triggerInstall,
  };
}

export function InstallPromptBar() {
  const { isInstallable, isIOS, triggerInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Delay prompt slightly for premium feel
    if (isInstallable) {
      const hasDismissed = localStorage.getItem('dforia_pwa_dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIosGuide(true);
    } else {
      const success = await triggerInstall();
      if (success) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('dforia_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!isInstallable || !showPrompt) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-[#7B1E3A] to-[#5c1328] text-white p-4 rounded-2xl shadow-xl border border-[#D4AF37]/30 flex items-center justify-between gap-3 relative overflow-hidden">
            {/* Soft glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Smartphone className="text-[#D4AF37]" size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-serif text-xs font-bold tracking-wide text-[#F5F1E8]">Instal D'Foria Kitchen</h4>
                <p className="text-[10px] text-gray-200 leading-tight">Akses menu lezat lebih cepat & hemat kuota.</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                id="btn-pwa-bar-install"
                onClick={handleInstall}
                className="bg-[#D4AF37] hover:bg-[#bfa032] active:scale-95 text-[#7B1E3A] font-bold text-[10.5px] px-3 py-1.5 rounded-lg shadow-soft transition-all cursor-pointer flex items-center gap-1"
              >
                <Download size={11} />
                <span>Instal</span>
              </button>
              <button
                id="btn-pwa-bar-dismiss"
                onClick={handleDismiss}
                className="p-1.5 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Manual Installation Guide Sheet */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#F5F1E8] w-full max-w-md rounded-t-[32px] p-6 text-gray-800 shadow-2xl border-t border-cream-dark/60"
            >
              <div className="flex items-center justify-between pb-4 border-b border-cream-dark/40 mb-5">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-primary" size={18} />
                  <h3 className="font-serif font-extrabold text-sm uppercase text-primary tracking-wider">Pasang di iPhone/iPad</h3>
                </div>
                <button
                  id="btn-ios-guide-close"
                  onClick={() => setShowIosGuide(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full bg-cream-dark/25 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium text-gray-700">
                <p className="text-[11px] text-gray-500 leading-relaxed text-center mb-2">
                  D'Foria Kitchen bisa dijalankan layaknya aplikasi native langsung dari layar utama iPhone Anda tanpa App Store.
                </p>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <div className="space-y-1">
                    <p className="font-bold">Ketuk tombol Bagikan (Share)</p>
                    <p className="text-[10px] text-gray-400">Tekan ikon <Share size={14} className="inline text-blue-500 mx-0.5" /> di bilah navigasi Safari bawah atau atas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <div className="space-y-1">
                    <p className="font-bold">Pilih "Tambah ke Layar Utama"</p>
                    <p className="text-[10px] text-gray-400">Scroll ke bawah dan pilih opsi <PlusSquare size={14} className="inline text-gray-600 mx-0.5" /> <strong>Tambah ke Layar Utama</strong> (Add to Home Screen).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div className="space-y-1">
                    <p className="font-bold">Selesai!</p>
                    <p className="text-[10px] text-gray-400">Aplikasi D'Foria Kitchen akan muncul di layar ponsel Anda dengan ikon premium kami.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-cream-dark/30">
                <button
                  id="btn-ios-guide-understand"
                  onClick={() => setShowIosGuide(false)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-button transition-all cursor-pointer text-center text-xs"
                >
                  Mengerti, Mengerti!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function InstallAppButton() {
  const { isInstallable, isIOS, triggerInstall } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIosGuide(true);
    } else {
      await triggerInstall();
    }
  };

  if (!isInstallable) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-[#7B1E3A] via-[#8F2344] to-[#7B1E3A] text-[#F5F1E8] rounded-3xl p-5 border border-[#D4AF37]/25 shadow-medium relative overflow-hidden animate-slide-up">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-lg pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-[#D4AF37]/15 rounded-2xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/35">
            <Smartphone size={22} className="animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif text-sm font-extrabold tracking-wide text-cream-light uppercase">Pasang Aplikasi D'Foria</h4>
            <p className="text-[10.5px] text-gray-200 leading-relaxed max-w-[90%] mx-auto font-medium">
              Akses menu dan kelola pesanan kuliner Anda langsung dari layar utama ponsel dengan satu kali ketukan!
            </p>
          </div>

          <button
            id="btn-pwa-inline-install"
            onClick={handleInstall}
            className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-[#7B1E3A] font-extrabold text-xs py-3 rounded-xl shadow-button transition-all hover-lift flex items-center justify-center space-x-2 cursor-pointer border border-[#D4AF37]/10"
          >
            <Download size={13} className="animate-bounce" />
            <span>PASANG SEKARANG</span>
          </button>
        </div>
      </div>

      {/* iOS Manual Installation Guide Sheet */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#F5F1E8] w-full max-w-md rounded-t-[32px] p-6 text-gray-800 shadow-2xl border-t border-cream-dark/60"
            >
              <div className="flex items-center justify-between pb-4 border-b border-cream-dark/40 mb-5">
                <div className="flex items-center gap-2">
                  <Smartphone className="text-primary" size={18} />
                  <h3 className="font-serif font-extrabold text-sm uppercase text-primary tracking-wider">Pasang di iPhone/iPad</h3>
                </div>
                <button
                  id="btn-ios-guide-inline-close"
                  onClick={() => setShowIosGuide(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full bg-cream-dark/25 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium text-gray-700">
                <p className="text-[11px] text-gray-500 leading-relaxed text-center mb-2">
                  D'Foria Kitchen bisa dijalankan layaknya aplikasi native langsung dari layar utama iPhone Anda tanpa App Store.
                </p>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <div className="space-y-1">
                    <p className="font-bold">Ketuk tombol Bagikan (Share)</p>
                    <p className="text-[10px] text-gray-400">Tekan ikon <Share size={14} className="inline text-blue-500 mx-0.5" /> di bilah navigasi Safari bawah atau atas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <div className="space-y-1">
                    <p className="font-bold">Pilih "Tambah ke Layar Utama"</p>
                    <p className="text-[10px] text-gray-400">Scroll ke bawah dan pilih opsi <PlusSquare size={14} className="inline text-gray-600 mx-0.5" /> <strong>Tambah ke Layar Utama</strong> (Add to Home Screen).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-cream-dark/30 shadow-soft">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div className="space-y-1">
                    <p className="font-bold">Selesai!</p>
                    <p className="text-[10px] text-gray-400">Aplikasi D'Foria Kitchen akan muncul di layar ponsel Anda dengan ikon premium kami.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-cream-dark/30">
                <button
                  id="btn-ios-guide-inline-understand"
                  onClick={() => setShowIosGuide(false)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-button transition-all cursor-pointer text-center text-xs"
                >
                  Mengerti, Mengerti!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
