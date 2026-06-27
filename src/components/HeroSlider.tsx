/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portraitMap, setPortraitMap] = useState<{ [url: string]: boolean }>({});
  const [loadedMap, setLoadedMap] = useState<{ [url: string]: boolean }>({});

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4500); // ganti gambar setiap 4.5 detik
    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleImageLoad = (url: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const isPortrait = img.naturalHeight > img.naturalWidth;
    setPortraitMap((prev) => ({ ...prev, [url]: isPortrait }));
    setLoadedMap((prev) => ({ ...prev, [url]: true }));
  };

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-[#F8F6F2] rounded-[28px] flex items-center justify-center text-gray-400 shadow-soft bg-skeleton-shimmer">
        <span className="font-serif italic text-sm">Sedang memuat banner...</span>
      </div>
    );
  }

  return (
    <div id="hero-slider-container" className="relative w-full aspect-[16/9] rounded-[28px] overflow-hidden bg-[#F8F6F2] shadow-soft group">
      {/* Slide Images with smooth cross-fade and zoom animations */}
      <div className="w-full h-full relative">
        {banners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          const isPortrait = portraitMap[banner.imageUrl] || false;
          const isLoaded = loadedMap[banner.imageUrl] || false;

          return (
            <div 
              key={banner.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Shimmer skeleton before image is loaded */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-skeleton-shimmer z-0" />
              )}

              <img
                src={banner.imageUrl}
                alt={`Banner ${index + 1}`}
                onLoad={(e) => handleImageLoad(banner.imageUrl, e)}
                style={{
                  transition: 'transform 8000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                }}
                className={`absolute inset-0 w-full h-full brightness-[0.72] ${
                  isPortrait ? 'object-contain' : 'object-cover'
                } object-center transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
          );
        })}

        {/* Caption Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white z-20 pointer-events-none">
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Cita Rasa Istimewa</p>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-tight max-w-[80%] text-cream-light">
            D'Foria Kitchen
          </h2>
          <p className="text-[11px] text-gray-200 mt-1">Hidangan higienis & lezat untuk momen berharga Anda.</p>
        </div>
      </div>

      {/* Slide Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-30 btn-scale"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-30 btn-scale"
            aria-label="Next Banner"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary w-4' : 'bg-white/50 w-1.5'
                } cursor-pointer`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
