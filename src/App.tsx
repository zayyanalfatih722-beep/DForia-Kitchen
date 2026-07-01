/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { dbService } from './lib/firebase';
import { MenuItem, CartItem, StoreSettings, Coupon } from './types';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import AdminBanner from './pages/AdminBanner';
import AdminCashier from './pages/AdminCashier';
import AdminFinance from './pages/AdminFinance';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import Testimonials from './pages/Testimonials';
import AdminTestimonials from './pages/AdminTestimonials';
import BottomNav from './components/BottomNav';
import WhatsAppButton from './components/WhatsAppButton';
import { InstallPromptBar } from './components/InstallPrompt';
import QuotaWarningBanner from './components/QuotaWarningBanner';

// Main layout wrapper to dynamically toggle BottomNav and WhatsApp contact helper
function AppContent() {
  const location = useLocation();

  // Initialize unique customer ID automatically on first visit
  useEffect(() => {
    let customerId = localStorage.getItem('df_customer_id');
    if (!customerId) {
      customerId = 'cust_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('df_customer_id', customerId);
    }
  }, []);

  // Load cart from localStorage or start empty
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('df_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to parse df_cart, resetting:", e);
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('df_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse df_applied_coupon, resetting:", e);
      return null;
    }
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('df_cart', JSON.stringify(cart));
  }, [cart]);

  // Save coupon to local storage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('df_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('df_applied_coupon');
    }
  }, [appliedCoupon]);

  // Subscribe to store settings real-time
  useEffect(() => {
    const unsubscribe = dbService.subscribeSettings((data) => {
      setSettings(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCart = (item: MenuItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.menuItem.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const handleUpdateNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const handleApplyCoupon = (coupon: Coupon | null) => {
    setAppliedCoupon(coupon);
  };

  const isClientSide = !location.pathname.startsWith('/admin');

  // ResizeObserver to adjust iframe parent height automatically in real-time
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const target = document.documentElement || document.body;
    if (!target) return;

    const sendHeight = () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      window.parent.postMessage({ type: 'resize-iframe', height }, '*');
      window.parent.postMessage({ height }, '*');
    };

    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(target);
    // Also observe document body just to be safe
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Trigger initial send and also send on layout updates
    sendHeight();
    window.addEventListener('load', sendHeight);
    window.addEventListener('resize', sendHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', sendHeight);
      window.removeEventListener('resize', sendHeight);
    };
  }, [location.pathname]); // Also re-trigger on path transitions

  return (
    <div className="bg-cream min-h-[100dvh] h-auto text-gray-800 selection:bg-primary/25 overflow-visible">
      <QuotaWarningBanner />
      {/* Routes Switch */}
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home onAddCart={handleAddCart} />} />
        <Route path="/menu" element={<Menu onAddCart={handleAddCart} />} />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateNotes={handleUpdateNotes}
              onRemoveItem={handleRemoveItem}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              onClearCart={handleClearCart}
              appliedCoupon={appliedCoupon}
            />
          }
        />
        <Route path="/orders" element={<OrderHistory />} />

        {/* Admin Control Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/banner" element={<AdminBanner />} />
        <Route path="/admin/cashier" element={<AdminCashier />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Floating Elements (only shown on customer pages) */}
      {isClientSide && (
        <>
          <BottomNav cart={cart} />
          <InstallPromptBar />
          {settings && (
            <WhatsAppButton
              phoneNumber={settings.whatsapp || '628123456789'}
              storeName={settings.storeName || "D'Foria Kitchen"}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
