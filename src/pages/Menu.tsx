/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Compass, Star, ArrowDownAZ, ArrowUp10, X, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { dbService } from '../lib/firebase';
import { MenuItem } from '../types';
import MenuCard from '../components/MenuCard';

interface MenuProps {
  onAddCart: (item: MenuItem) => void;
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'rating';

export default function Menu({ onAddCart }: MenuProps) {
  const [menus, setMenus] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem('df_cached_menus');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('df_cached_menus');
      return cached ? false : true;
    } catch (e) {
      return true;
    }
  });
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const hasCache = localStorage.getItem('df_cached_menus');
    if (!hasCache) {
      setLoading(true);
    }
    // If Firestore takes more than 3.5 seconds to respond, force use local cache to ensure customer can view menus
    const fallbackTimeout = setTimeout(() => {
      try {
        const cached = localStorage.getItem('df_cached_menus');
        if (cached) {
          setMenus(JSON.parse(cached));
        }
      } catch (e) {}
      setLoading(false);
    }, 3500);

    const unsubscribe = dbService.subscribeMenus((fetched) => {
      clearTimeout(fallbackTimeout);
      setMenus(fetched);
      setLoading(false);
    });

    return () => {
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, []);

  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Cemilan'];

  // Filter items
  const filteredMenus = menus.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort items
  const sortedMenus = [...filteredMenus].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default (unsorted/natural)
  });

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in">
      <div className="mb-4">
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Katalog Hidangan</span>
        <h1 className="font-serif text-2xl font-bold text-gray-800">Daftar Menu</h1>
      </div>

      {/* Advanced Search & Filtering Controls */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <Search size={18} />
        </span>
        <input
          id="menu-search-input"
          type="text"
          placeholder="Cari makanan, minuman, cemilan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-gray-700 placeholder-gray-400 text-sm pl-11 pr-4 py-3 rounded-2xl border border-cream-dark/50 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
      </div>

      {/* Categories Bar */}
      <div className="mb-4 overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex space-x-2">
          {categories.map((cat) => (
            <button
              id={`menu-cat-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-gray-500 border border-cream-dark/50 hover:bg-cream/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Buttons */}
      <div className="flex items-center justify-between mb-4 bg-white/70 p-2.5 rounded-xl border border-cream-dark/30 shadow-soft">
        <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium">
          <SlidersHorizontal size={14} className="text-primary" />
          <span>Urutkan:</span>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setSortBy(sortBy === 'price-low' ? 'price-high' : 'price-low')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
              sortBy.startsWith('price') ? 'bg-primary/15 text-primary' : 'bg-transparent text-gray-500 hover:bg-cream/30'
            }`}
          >
            <ArrowUp10 size={12} />
            <span>Harga {sortBy === 'price-low' ? '▲' : '▼'}</span>
          </button>
          <button
            onClick={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
              sortBy === 'rating' ? 'bg-primary/15 text-primary' : 'bg-transparent text-gray-500 hover:bg-cream/30'
            }`}
          >
            <Star size={11} fill={sortBy === 'rating' ? 'currentColor' : 'none'} />
            <span>Rating Terbaik</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="font-serif italic text-xs text-gray-400">Menyusun menu istimewa...</p>
        </div>
      ) : sortedMenus.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center border border-cream-dark/40 shadow-soft">
          <Compass className="mx-auto text-gray-300 mb-2" size={36} />
          <p className="text-sm font-serif font-semibold text-gray-500 mb-1">Hidangan tidak ditemukan</p>
          <p className="text-xs text-gray-400">Silakan ubah kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {sortedMenus.map((item) => (
            <MenuCard 
              key={item.id} 
              item={item} 
              onAdd={onAddCart} 
              onPreview={setSelectedItem}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 max-w-[95vw] max-h-[85vh] flex flex-col items-center justify-center"
            >
              {/* Close Button */}
              <button
                id="btn-close-preview"
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-white flex items-center justify-center"
              >
                <X size={20} />
              </button>

              {/* Large Image Showcase */}
              <div className="w-full max-h-[75vh] bg-transparent rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl relative border border-white/10">
                <img
                  src={selectedItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000'}
                  alt={selectedItem.name}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Menu Name Label */}
              <div className="mt-4 bg-black/50 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-4.5 py-2 rounded-full shadow-lg max-w-xs text-center truncate">
                {selectedItem.name}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
