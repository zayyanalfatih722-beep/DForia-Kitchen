import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Image, 
  ClipboardList, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Ticket, 
  Settings, 
  Bell, 
  Home, 
  LogOut,
  MessageSquare,
  X,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../lib/firebase';
import { Order } from '../types';

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [activeNotification, setActiveNotification] = useState<Order | null>(null);
  const [notifPermission, setNotifPermission] = useState<'default' | 'granted' | 'denied'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  const [seenOrderIds, setSeenOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('df_seen_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Sync seen order IDs across tabs via standard storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'df_seen_orders') {
        try {
          setSeenOrderIds(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.warn("Error parsing synced seen orders:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Auto-dismiss popup notification after 8 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('Rp', 'Rp ').trim();
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Warm elegant bell - First note (E5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain1.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.45);

      // Second note (A5) slightly delayed
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.16); // A5
      gain2.gain.setValueAtTime(0, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.18, audioCtx.currentTime + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.16);
      osc2.stop(audioCtx.currentTime + 0.65);
    } catch (err) {
      console.warn("Autoplay or browser audio context prevented sound:", err);
    }
  };

  const triggerBrowserNotification = (order: Order) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const formattedTotal = formatIDR(order.totalAmount);

        const notification = new Notification('Pesanan Baru Masuk', {
          body: `Pelanggan: ${order.customerName} - Total: ${formattedTotal}`,
          icon: '/icons/icon.svg',
          tag: order.id,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          navigate('/admin/orders');
          notification.close();
        };
      } catch (err) {
        console.warn("Failed to show push notification:", err);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    // Auto-request notification permission on dashboard load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotifPermission(permission);
      });
    }

    // Real-time listener for orders
    const unsubscribe = dbService.subscribeOrders((fetchedOrders) => {
      const pendingOrders = fetchedOrders.filter(o => o.status === 'Menunggu Konfirmasi');

      const isViewingOrders = location.pathname === '/admin/orders';
      if (isViewingOrders && pendingOrders.length > 0) {
        // Automatically mark all current pending orders as seen!
        setSeenOrderIds(prev => {
          const updated = Array.from(new Set([...prev, ...pendingOrders.map(o => o.id)]));
          localStorage.setItem('df_seen_orders', JSON.stringify(updated));
          return updated;
        });
        setPendingCount(0);
      } else {
        // Only count pending orders that are NOT seen
        let currentSeen: string[] = [];
        try {
          const saved = localStorage.getItem('df_seen_orders');
          currentSeen = saved ? JSON.parse(saved) : [];
        } catch (e) {
          currentSeen = [];
        }
        const unseenPending = pendingOrders.filter(o => !currentSeen.includes(o.id));
        setPendingCount(unseenPending.length);
      }

      // Track the incoming orders
      if (isFirstLoad.current) {
        // Mark all initial existing orders as already known
        fetchedOrders.forEach(o => knownOrderIds.current.add(o.id));
        isFirstLoad.current = false;
      } else {
        // Look for brand new pending orders
        fetchedOrders.forEach(o => {
          if (!knownOrderIds.current.has(o.id)) {
            knownOrderIds.current.add(o.id);

            if (o.status === 'Menunggu Konfirmasi') {
              // Trigger instant notification chimes & cards
              playNotificationSound();
              setActiveNotification(o);
              triggerBrowserNotification(o);
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    dbService.logoutAdmin();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      label: 'Kelola Menu',
      icon: UtensilsCrossed,
      path: '/admin/menu'
    },
    {
      label: 'Kelola Banner',
      icon: Image,
      path: '/admin/banner'
    },
    {
      label: 'Pesanan',
      icon: ClipboardList,
      path: '/admin/orders',
      showBadge: pendingCount > 0,
      badgeValue: pendingCount
    },
    {
      label: 'Kasir',
      icon: Calculator,
      path: '/admin/cashier'
    },
    {
      label: 'Keuangan',
      icon: TrendingUp,
      path: '/admin/finance'
    },
    {
      label: 'Laporan',
      icon: BarChart3,
      path: '/admin/reports'
    },
    {
      label: 'Testimoni',
      icon: MessageSquare,
      path: '/admin/testimonials'
    },
    {
      label: 'Pengaturan',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  const currentPath = location.pathname;

  return (
    <header className="bg-white border-b border-cream-dark sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 border-b border-cream/40">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <span className="font-serif font-bold text-sm sm:text-base text-primary tracking-tight">D'Foria Admin</span>
          </div>

          {/* Action Icons exactly as in screenshot */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button 
              id="header-notification-bell"
              onClick={() => navigate('/admin/orders')}
              className="relative p-1.5 text-gray-500 hover:text-primary transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-sans text-[8px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow-sm border border-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Back to Toko button */}
            <button
              id="header-back-to-toko"
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 hover:text-primary hover:bg-cream-light/60 transition-all border border-cream-dark/30 cursor-pointer"
            >
              <Home size={13} className="text-gray-500" />
              <span>Toko</span>
            </button>

            {/* Log Out icon */}
            <button
              id="header-logout"
              onClick={handleLogout}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Keluar Sesi"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Pills exactly as in screenshot */}
        <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center space-x-2">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                id={`pill-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-soft font-bold'
                    : 'bg-cream-light hover:bg-cream/50 text-gray-700 hover:text-primary border border-cream-dark/30'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'} />
                <span>
                  {item.label === 'Pesanan' && item.showBadge 
                    ? `Pesanan (${item.badgeValue})` 
                    : item.label}
                </span>
                {item.showBadge && item.label !== 'Pesanan' && (
                  <span className="ml-1 bg-red-600 text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Order Popup Toast Notification */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="fixed top-20 right-4 z-50 w-80 bg-[#F5F1E8] border border-[#7B1E3A]/20 border-l-4 border-l-[#7B1E3A] rounded-2xl shadow-2xl p-4 text-gray-800 flex flex-col gap-3.5 relative overflow-hidden"
          >
            {/* Soft gold glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔔</span>
                <span className="font-serif font-black text-[10.5px] uppercase tracking-wider text-[#7B1E3A]">
                  Pesanan Baru Masuk
                </span>
              </div>
              <button
                id="btn-close-active-toast"
                onClick={() => setActiveNotification(null)}
                className="p-1 text-gray-400 hover:text-gray-700 bg-white/60 hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Sembunyikan"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-gray-700 font-medium">
              <div className="flex justify-between border-b border-cream-dark/30 pb-1">
                <span className="text-gray-400 font-sans">Nama Pelanggan</span>
                <strong className="text-gray-950 font-extrabold">{activeNotification.customerName}</strong>
              </div>
              <div className="flex justify-between border-b border-cream-dark/30 pb-1">
                <span className="text-gray-400 font-sans">Nomor Pesanan</span>
                <span className="font-mono text-[10.5px] text-gray-700 bg-white/80 px-1 py-0.5 rounded border border-cream-dark/25">
                  #{activeNotification.id}
                </span>
              </div>
              <div className="flex justify-between border-b border-cream-dark/30 pb-1">
                <span className="text-gray-400 font-sans">Nomor Meja</span>
                <span className="bg-[#7B1E3A]/10 text-[#7B1E3A] font-bold px-2 py-0.5 rounded-full text-[10px]">
                  Meja {activeNotification.tableNumber}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-400 font-sans">Total Pesanan</span>
                <strong className="text-[#7B1E3A] font-serif font-bold text-sm">
                  {formatIDR(activeNotification.totalAmount)}
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                id="btn-toast-view-orders"
                onClick={() => {
                  navigate('/admin/orders');
                  setActiveNotification(null);
                }}
                className="flex-1 bg-[#7B1E3A] hover:bg-[#5c1328] text-white font-extrabold text-[10.5px] py-2 rounded-xl text-center shadow-button transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Lihat Pesanan
              </button>
              <button
                id="btn-toast-dismiss"
                onClick={() => setActiveNotification(null)}
                className="px-4 bg-white hover:bg-gray-100 text-gray-600 border border-cream-dark/55 font-bold text-[10.5px] py-2 rounded-xl text-center transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
