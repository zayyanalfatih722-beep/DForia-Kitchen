/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { Clock } from 'lucide-react';

interface PremiumInfoBarProps {
  settings: StoreSettings | null;
}

export default function PremiumInfoBar({ settings }: PremiumInfoBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Use Intl to format explicitly in WIB (Asia/Jakarta)
  const jakartaFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = jakartaFormatter.formatToParts(currentTime);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';

  const dayName = getValue('weekday');
  const dateNum = getValue('day');
  const monthName = getValue('month');
  const year = getValue('year');
  const hours = getValue('hour').padStart(2, '0');
  const minutes = getValue('minute').padStart(2, '0');
  const seconds = getValue('second').padStart(2, '0');

  const opening = String(settings?.openingHour || '08:00');
  const closing = String(settings?.closingHour || '22:00');

  // Check store status
  const isStoreOpen = () => {
    // If manually closed by admin, return false
    if (settings && settings.isOpen === false) {
      return false;
    }
    const currentMinutes = Number(hours) * 60 + Number(minutes);
    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);
    const startMinutes = (openH || 8) * 60 + (openM || 0);
    const endMinutes = (closeH || 22) * 60 + (closeM || 0);

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const openStatus = isStoreOpen();

  // Marquee Messages
  const marqueeMessages = [
    "Selamat datang di D'Foria Kitchen",
    `Buka setiap hari pukul ${opening} - ${closing}`,
    "Promo spesial hari ini tersedia",
    "Terima kasih telah berkunjung"
  ].join("  •  ") + "  •  ";

  return (
    <div id="premium-info-bar" className="w-full bg-white/70 backdrop-blur-md rounded-[22px] border border-cream-dark/65 p-3.5 shadow-soft mb-6 space-y-2.5 transition-all duration-300 hover:shadow-medium">
      {/* Top row: Status and Date/Clock */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-[11px] font-semibold text-gray-700">
        {/* Status Indicator */}
        <div className="flex items-center space-x-1.5 bg-cream/40 px-3 py-1 rounded-full border border-cream-dark/40 shadow-inner w-fit">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${openStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="font-serif tracking-wide text-[10px] font-bold text-gray-800">
            {openStatus ? '🟢 Toko Sedang Buka' : '🔴 Toko Sedang Tutup'}
          </span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center space-x-1.5 text-gray-500 bg-cream/20 px-3 py-1 rounded-full border border-cream-dark/20 w-fit self-end xs:self-auto">
          <Clock size={12} className="text-primary/70 animate-pulse" />
          <span className="font-sans text-[10px] tracking-tight text-gray-600">
            {dayName}, {dateNum} {monthName} {year} &nbsp;•&nbsp; <strong className="font-mono text-primary font-bold">{hours}:{minutes}:{seconds}</strong> WIB
          </span>
        </div>
      </div>

      {/* Scrolling Text (Marquee Animation) */}
      <div className="relative w-full overflow-hidden bg-primary/5 py-1.5 px-3 rounded-xl border border-primary/10 flex items-center">
        {/* Left and Right Fade Gradients */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-cream-light/50 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-cream-light/50 to-transparent pointer-events-none z-10"></div>

        {/* Marquee Inner */}
        <div className="w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block">
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider pr-4">
              {marqueeMessages}
            </span>
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider pr-4">
              {marqueeMessages}
            </span>
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider pr-4">
              {marqueeMessages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
