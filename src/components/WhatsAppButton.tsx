/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquareCode } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  storeName: string;
}

export default function WhatsAppButton({ phoneNumber, storeName }: WhatsAppButtonProps) {
  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  const handleClick = () => {
    const message = encodeURIComponent(`Halo ${storeName}, saya ingin bertanya mengenai layanan pemesanan makanan.`);
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      id="floating-whatsapp-button"
      onClick={handleClick}
      aria-label="Hubungi kami melalui WhatsApp"
      className="fixed bottom-20 right-6 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-medium transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer animate-float-pulse"
    >
      <MessageSquareCode size={24} />
    </button>
  );
}
