import React, { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { dbService } from '../lib/firebase';

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    // Load pending orders count
    const fetchPendingOrders = async () => {
      try {
        const orders = await dbService.getOrders();
        const pending = orders.filter(o => o.status === 'Pending').length;
        setPendingCount(pending);
      } catch (err) {
        console.error("Failed to load pending orders for header:", err);
      }
    };

    fetchPendingOrders();
    // Refresh count every 15 seconds to keep it live
    const interval = setInterval(fetchPendingOrders, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

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
                <span>{item.label}</span>
                {item.showBadge && (
                  <span className="ml-1 bg-red-600 text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
