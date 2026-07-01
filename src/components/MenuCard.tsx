/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MenuItem } from '../types';
import { Star, Plus, ShieldCheck } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onPreview?: (item: MenuItem) => void;
  key?: React.Key;
}

export default function MenuCard({ item, onAdd, onPreview }: MenuCardProps) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(item.price);

  const isAvailable = item.isAvailable !== undefined ? item.isAvailable : (item.available !== undefined ? item.available : true);
  const stock = item.stock !== undefined ? item.stock : 20;
  const isOutOfStock = stock <= 0;

  const [isImageLoaded, setIsImageLoaded] = React.useState(false);

  return (
    <div
      id={`menu-card-${item.id}`}
      className="bg-white rounded-[20px] overflow-hidden shadow-soft border border-cream-dark/40 flex flex-col hover-lift animate-slide-up relative"
    >
      {/* Bestseller Badge */}
      {item.bestseller && (
        <span id={`badge-bestseller-${item.id}`} className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-0.5">
          <Star size={8} fill="currentColor" />
          <span>Bestseller</span>
        </span>
      )}

      {/* Item Image Container - Aspect Ratio 4/3 */}
      <div 
        onClick={() => onPreview?.(item)}
        className="w-full aspect-[4/3] bg-[#F8F6F2] p-2 rounded-t-[20px] relative overflow-hidden flex items-center justify-center cursor-pointer group"
      >
        {/* Shimmer loading skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-skeleton-shimmer z-0" />
        )}

        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
          alt={item.name}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-contain object-center transition-all duration-500 group-hover:scale-108 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          referrerPolicy="no-referrer"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-500 text-white font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Tutup
            </span>
          </div>
        )}
        {isAvailable && isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div 
        onClick={() => onPreview?.(item)}
        className="p-3.5 flex-1 flex flex-col cursor-pointer hover:bg-cream/[0.15] transition-colors duration-200"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{item.category}</span>
          <div className="flex items-center space-x-0.5 text-amber-500">
            <Star size={11} fill="currentColor" />
            <span className="text-xs font-semibold">{item.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-serif font-bold text-sm text-gray-800 line-clamp-1 mb-1" title={item.name}>
          {item.name}
        </h3>

        <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-cream/50">
          <div className="flex flex-col">
            <span className="font-mono text-[13px] font-bold text-primary">{formattedPrice}</span>
            {isAvailable && !isOutOfStock && (
              <span className={`text-[9.5px] font-bold ${stock <= 5 ? 'text-amber-600 animate-pulse' : 'text-gray-500'}`}>
                Sisa {stock} porsi
              </span>
            )}
          </div>
          {!isAvailable ? (
            <span className="text-[10px] font-bold text-gray-400 italic">Tutup</span>
          ) : isOutOfStock ? (
            <span className="text-[10px] font-bold text-red-500 italic">Habis</span>
          ) : (
            <button
              id={`btn-add-item-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item);
              }}
              className="bg-primary hover:bg-primary-dark text-white p-1.5 rounded-full shadow-soft transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
              title="Tambah ke Keranjang"
            >
              <Plus size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
