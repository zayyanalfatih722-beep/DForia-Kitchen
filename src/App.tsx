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
import AdminCoupons from './pages/AdminCoupons';
import AdminSettings from './pages/AdminSettings';
import Testimonials from './pages/Testimonials';
import AdminTestimonials from './pages/AdminTestimonials';
import BottomNav from './components/BottomNav';
import WhatsAppButton from './components/WhatsAppButton';

// Main layout wrapper to dynamically toggle BottomNav and WhatsApp contact helper
function AppContent() {
  const location = useLocation();

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

  // Fetch store settings on mount
  useEffect(() => {
    async function loadSettings() {
      const data = await dbService.getSettings();
      setSettings(data);
    }
    loadSettings();
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

  return (
    <div className="bg-cream min-h-screen text-gray-800 selection:bg-primary/25">
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
        <Route path="/testimoni" element={<Testimonials />} />

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
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Floating Elements (only shown on customer pages) */}
      {isClientSide && (
        <>
          <BottomNav cart={cart} />
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
