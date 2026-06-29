/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList, Settings, MessageSquare } from 'lucide-react';
import { CartItem } from '../types';

interface BottomNavProps {
  cart: CartItem[];
}

export default function BottomNav({ cart }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Beranda',
      icon: Home,
      path: '/'
    },
    {
      label: 'Menu',
      icon: UtensilsCrossed,
      path: '/menu'
    },
    {
      label: 'Keranjang',
      icon: ShoppingBag,
      path: '/cart',
      badge: totalItems > 0 ? totalItems : undefined
    },
    {
      label: 'Pesanan',
      icon: ClipboardList,
      path: '/orders'
    },
    {
      label: 'Admin',
      icon: Settings,
      path: '/admin/dashboard'
    }
  ];

  return (
    <div id="bottom-navigation-container" className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cream-dark shadow-lg px-6 py-2.5 max-w-md mx-auto rounded-t-[24px]">
      <div className="flex justify-around items-center">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              id={`nav-item-${index}`}
              key={index}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center relative py-1 px-3 transition-all duration-300 rounded-xl hover:bg-cream/50 cursor-pointer"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    active ? 'text-primary' : 'text-gray-400'
                  }`}
                />
                {item.badge !== undefined && (
                  <span id={`nav-badge-${index}`} className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 transition-all duration-300 ${
                  active ? 'text-primary font-semibold' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span id={`active-indicator-${index}`} className="absolute bottom-0 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
