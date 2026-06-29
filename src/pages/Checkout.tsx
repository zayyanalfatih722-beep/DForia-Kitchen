/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Landmark, Wallet, CheckCircle2, ShieldCheck, Copy, Check, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Order, PaymentMethod, Coupon, StoreSettings } from '../types';
import { dbService } from '../lib/firebase';
import { useMemo } from 'react';

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
  appliedCoupon: Coupon | null;
}

export default function Checkout({ cart, onClearCart, appliedCoupon }: CheckoutProps) {
  const navigate = useNavigate();

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Settings for Bank Details
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Success State & Loading State
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate stable randomized thank you message for the specific customer order
  const thankYouMessage = useMemo(() => {
    if (!successOrder) return { title: '', body: '' };
    const name = successOrder.customerName;
    const variations = [
      {
        title: `Terima kasih, ${name}! 💖`,
        body: `Tim D'Foria Kitchen sudah tidak sabar menyiapkan hidangan lezat untukmu.`
      },
      {
        title: `Hai ${name}! 🍽️`,
        body: `Pesananmu sudah berhasil dibuat. Tinggal satu langkah lagi untuk menikmati hidangan favoritmu.`
      },
      {
        title: `Terima kasih, ${name} ✨`,
        body: `Kami sangat senang kamu memilih D'Foria Kitchen hari ini.`
      },
      {
        title: `${name}, terima kasih telah memesan di D'Foria Kitchen 🌷`,
        body: `Hidangan spesialmu sedang menunggu konfirmasi.`
      }
    ];

    // Simple hash of the order ID to pick a stable index
    let hash = 0;
    for (let i = 0; i < successOrder.id.length; i++) {
      hash += successOrder.id.charCodeAt(i);
    }
    const index = hash % variations.length;
    return variations[index];
  }, [successOrder]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const fetched = await dbService.getSettings();
        setSettings(fetched);
      } catch (err) {
        console.error("Error fetching settings for Checkout:", err);
      }
    }
    loadSettings();
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert('Mohon lengkapi Nama Pelanggan dan Nomor WhatsApp Anda!');
      return;
    }

    setLoading(true);

    const customerId = localStorage.getItem('df_customer_id') || 'cust_' + Math.random().toString(36).substring(2, 15);
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: orderId,
      customerId,
      customerName,
      tableNumber: phoneNumber, // map tableNumber to phone for compatibility with standard layouts
      phoneNumber: phoneNumber,
      notes: notes.trim() || undefined,
      items: cart.map(item => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        notes: item.notes.trim() || undefined,
        image: item.menuItem.image
      })),
      totalAmount: grandTotal,
      paymentMethod,
      status: 'Menunggu Konfirmasi',
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.addOrder(newOrder);

      // Save to local list of order IDs for the user's history screen
      const userOrderIds = JSON.parse(localStorage.getItem('df_user_order_ids') || '[]');
      userOrderIds.push(orderId);
      localStorage.setItem('df_user_order_ids', JSON.stringify(userOrderIds));

      setSuccessOrder(newOrder);
      onClearCart();
    } catch (err) {
      console.error("Error creating order:", err);
      alert('Gagal membuat pesanan. Silakan coba lagi!');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppOrder = async (order: Order) => {
    try {
      await dbService.decrementOrderStock(order.id);
    } catch (err) {
      console.error("Gagal mengurangi stok:", err);
    }

    const storeWa = settings?.whatsapp || '6282255994981';
    const cleanPhone = storeWa.replace(/[^0-9]/g, '');
    
    const itemsText = order.items
      .map((item) => `- ${item.name} (${item.quantity}x)`)
      .join('\n');
      
    const isTransfer = order.paymentMethod === 'Transfer Bank';
    const transferNote = isTransfer 
      ? `\n*PENTING (TRANSFER BANK):*\nMohon kirimkan *Foto/Screenshot Bukti Transfer* setelah pesan ini ya Kak agar pesanan bisa langsung kami verifikasi & proses! 🙏\n`
      : '';

    const message = encodeURIComponent(
      `*KONFIRMASI PESANAN D'FORIA*\n\n` +
      `Halo Kak! Saya baru saja melakukan pemesanan di D'Foria Kitchen:\n\n` +
      `• *ID Pesanan:* ${order.id}\n` +
      `• *Nama Pelanggan:* ${order.customerName}\n` +
      `• *No. WhatsApp:* ${order.phoneNumber}\n` +
      `• *Metode Bayar:* ${order.paymentMethod}\n` +
      `• *Catatan:* ${order.notes || '-'}\n\n` +
      `*Daftar Pesanan:*\n${itemsText}\n\n` +
      `*TOTAL TAGIHAN:* ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.totalAmount)}\n\n` +
      transferNote +
      `Mohon segera diproses ya Kak, terima kasih! 🙏✨`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  // If order was successful, show Confirmation View
  if (successOrder) {
    // Generate particles for subtle premium confetti
    const confettiColors = ['#D4AF37', '#7B1E3A', '#EAE3D2', '#9B304F', '#C0C0C0'];
    const confettiParticles = Array.from({ length: 40 }).map((_, i) => {
      const angle = (i / 40) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const velocity = 80 + Math.random() * 120;
      return {
        id: i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 100,
        size: 5 + Math.random() * 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.2,
        rotation: Math.random() * 360,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      };
    });

    return (
      <div className="pb-28 pt-8 px-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-[32px] p-6 shadow-medium border border-cream-dark/30 flex flex-col items-center relative overflow-hidden text-center"
        >
          {/* Subtle luxury gold gradient line at the top */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          {/* Glowing premium backdrop highlights */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          {/* Subtly Animated Confetti Shower */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: -40, opacity: 1, scale: 0.8, rotate: p.rotation }}
                animate={{ 
                  x: p.x, 
                  y: p.y + 400, 
                  opacity: [1, 1, 0], 
                  scale: [0.8, 1.2, 0.4],
                  rotate: p.rotation + 360 
                }}
                transition={{ 
                  duration: 2.8 + Math.random() * 1.5, 
                  delay: p.delay, 
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '25%',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.borderRadius,
                  transformOrigin: 'center'
                }}
              />
            ))}
          </div>

          {/* Gold Glowing Icon Wrapper */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.15 }}
            className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] rounded-full flex items-center justify-center mb-6 shadow-soft relative z-10"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CheckCircle2 size={44} className="text-[#D4AF37]" />
            </motion.div>
          </motion.div>

          {/* Success Header & Messages */}
          <div className="space-y-3 mb-6 relative z-10 max-w-[90%] mx-auto">
            <h1 className="font-serif text-xl font-extrabold text-[#7B1E3A] tracking-wide leading-tight">
              {thankYouMessage.title}
            </h1>
            <p className="text-[12.5px] text-gray-700 leading-relaxed font-medium">
              {thankYouMessage.body}
            </p>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-[#F8F6F2] rounded-2xl p-4 border border-cream-dark/50 w-full mb-6 text-left relative z-10">
            <div className="flex justify-between items-center pb-2 border-b border-cream-dark/30 mb-2.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">ID PESANAN</span>
              <span className="font-mono font-bold text-primary text-xs bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 select-all">
                {successOrder.id}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Nama Pelanggan</span>
                <span className="font-bold text-gray-800">{successOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp</span>
                <span className="font-mono font-medium text-gray-700">{successOrder.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-semibold text-gray-800 bg-cream-dark/30 px-1.5 py-0.5 rounded text-[10px]">
                  {successOrder.paymentMethod}
                </span>
              </div>
              {successOrder.notes && (
                <div className="pt-1.5 border-t border-cream-dark/20 text-[10px]">
                  <span className="block text-gray-400 font-medium">Catatan:</span>
                  <p className="text-gray-600 italic bg-white/40 p-1.5 rounded border border-cream-dark/10 mt-0.5 leading-relaxed">
                    "{successOrder.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Bank Success Information */}
          {successOrder.paymentMethod === 'Transfer Bank' && (
            <div className="bg-[#7B1E3A]/5 p-4 rounded-2xl border border-primary/10 mb-6 w-full flex flex-col items-start text-left space-y-2 text-xs text-gray-700 relative z-10">
              <div className="flex items-center space-x-1.5 self-center mb-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Landmark size={12} className="text-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Panduan Transfer Bank</span>
              </div>
              <div className="w-full grid grid-cols-3 gap-y-1.5 pb-2.5 border-b border-cream-dark/30">
                <span className="text-gray-400 font-medium">Bank:</span>
                <span className="col-span-2 font-bold text-gray-800">{settings?.bankName || 'Bank Central Asia (BCA)'}</span>
                
                <span className="text-gray-400 font-medium">No. Rekening:</span>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-primary select-all text-xs">
                    {settings?.bankAccountNumber || '8420994981'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(settings?.bankAccountNumber || '8420994981');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[10px] font-bold text-[#D4AF37] hover:text-primary transition-colors cursor-pointer bg-[#D4AF37]/10 px-2 py-0.5 rounded"
                  >
                    {copied ? 'Disalin! ✓' : 'Salin'}
                  </button>
                </div>
                
                <span className="text-gray-400 font-medium">Atas Nama:</span>
                <span className="col-span-2 font-semibold text-gray-800">{settings?.bankAccountHolder || "D'Foria Kitchen Indonesia"}</span>
              </div>
              <div className="w-full pt-1.5 text-center font-bold text-primary font-mono text-[14px]">
                TOTAL TRANSFER: {formatPrice(successOrder.totalAmount)}
              </div>
              <p className="text-[11px] text-[#7B1E3A] font-bold text-center leading-normal w-full pt-1.5 border-t border-cream-dark/20">
                Setelah transfer, mohon kirimkan *Foto/Screenshot Bukti Pembayaran* ke WhatsApp bersama dengan list pesanan Anda untuk proses cepat! 🙏
              </p>
            </div>
          )}

          {/* COD Success Information */}
          {successOrder.paymentMethod === 'COD' && (
            <div className="bg-[#D4AF37]/5 p-4 rounded-2xl border border-[#D4AF37]/20 mb-6 w-full text-center relative z-10">
              <div className="flex items-center justify-center space-x-1.5 mb-1 bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/25 w-max mx-auto">
                <Wallet size={12} className="text-[#D4AF37]" />
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Bayar di Tempat (COD)</p>
              </div>
              <p className="text-[11px] text-gray-700 leading-normal max-w-[90%] mx-auto mb-1 font-medium">
                Siapkan tunai sebesar <strong className="text-primary font-mono font-bold">{formatPrice(successOrder.totalAmount)}</strong> saat pesanan Anda diantar.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 w-full relative z-10">
            {/* Highlighted Warning Card */}
            <div className="w-full bg-[#FFF8EB] border border-[#E2B93B]/40 rounded-2xl p-4.5 text-left relative overflow-hidden shadow-soft">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#E2B93B]" />
              <div className="pl-2.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-[#7B1E3A] font-extrabold text-[11px] uppercase tracking-wider">
                  <span>⚠️ LANGKAH TERAKHIR</span>
                </div>
                <p className="text-[12.5px] font-black text-gray-800 leading-normal">
                  Pesanan Anda <span className="text-[#7B1E3A] underline underline-offset-2 decoration-2 font-black">BELUM</span> diproses.
                </p>
                <p className="text-[11.5px] text-gray-600 leading-relaxed">
                  Silakan tekan tombol WhatsApp di bawah untuk mengirim pesanan ke admin.
                </p>
                <div className="flex items-start space-x-1.5 text-[11px] font-extrabold text-[#7B1E3A] bg-[#7B1E3A]/5 border border-[#7B1E3A]/15 rounded-xl px-2.5 py-2 mt-2">
                  <span className="shrink-0 text-xs">➡️</span>
                  <span className="leading-relaxed font-black">Pesanan hanya akan diproses setelah dikirim ke WhatsApp.</span>
                </div>
              </div>
            </div>

            {/* Subtle animated downward arrow pointing to the WhatsApp button */}
            <div className="flex flex-col items-center pt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Kirim Rincian Pesanan
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-[#128C7E]"
              >
                <ArrowDown size={20} className="stroke-[3]" />
              </motion.div>
            </div>

            {/* Premium WhatsApp Button with gentle pulse animation */}
            <motion.button
              id="btn-whatsapp-confirm"
              onClick={() => sendWhatsAppOrder(successOrder)}
              animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                  "0 4px 14px 0 rgba(37, 211, 102, 0.2)",
                  "0 4px 22px 6px rgba(37, 211, 102, 0.45)",
                  "0 4px 14px 0 rgba(37, 211, 102, 0.2)"
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-[#0F5132] text-sm font-black py-4 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2.5 border border-[#1f9c4d]/30"
            >
              <svg className="w-5 h-5 fill-[#0F5132]" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.412 1.451 5.428 0 9.85-4.417 9.853-9.852.002-2.633-1.021-5.107-2.885-6.973C17.162 1.916 14.693.892 12.062.89 6.634.89 2.221 5.302 2.218 10.73c-.001 1.932.504 3.82 1.463 5.433l-.961 3.511 3.593-.942z"/>
              </svg>
              <span>Kirim Pesanan ke WhatsApp</span>
            </motion.button>
            
            {/* Back to Home Button (understated, gray styling) */}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-transparent hover:bg-gray-50 text-gray-400 hover:text-gray-600 text-xs font-semibold py-3.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200"
            >
              Kembali ke Beranda
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in">
      {/* Header back button */}
      <div className="flex items-center space-x-3 mb-5">
        <button
          onClick={() => navigate('/cart')}
          className="bg-white p-2 rounded-full border border-cream-dark/40 shadow-soft text-gray-500 hover:text-primary transition-colors cursor-pointer"
          title="Kembali"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Langkah Terakhir</span>
          <h1 className="font-serif text-xl font-bold text-gray-800">Pembayaran</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Information Cards */}
        <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-4">
          <h2 className="font-serif text-sm font-bold text-gray-800 border-b border-cream/50 pb-2">Informasi Kontak & Pelanggan</h2>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="cust-name-input">
              Nama Pelanggan
            </label>
            <input
              id="cust-name-input"
              type="text"
              required
              placeholder="Contoh: Zea, Ryan, dll."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-cream/20 text-gray-700 placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl border border-cream-dark/40 focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="cust-phone-input">
              Nomor WhatsApp Pelanggan
            </label>
            <input
              id="cust-phone-input"
              type="text"
              required
              placeholder="08xxxxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-cream/20 text-gray-700 placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl border border-cream-dark/40 focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="notes-input">
              Catatan Khusus Pesanan (Opsional)
            </label>
            <textarea
              id="notes-input"
              rows={3}
              placeholder="Contoh: Sambal dipisah, minta sendok garpu, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-cream/20 text-gray-700 placeholder-gray-400 text-xs px-3.5 py-3 rounded-xl border border-cream-dark/40 focus:outline-none focus:ring-1 focus:ring-primary/45 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* Payment Methods selector */}
        <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-4">
          <h2 className="font-serif text-sm font-bold text-gray-800 border-b border-cream/50 pb-2">Metode Pembayaran</h2>

          <div className="grid grid-cols-2 gap-3">
            {/* COD button */}
            <button
              id="payment-cod-button"
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 rounded-2xl border flex flex-col items-center space-y-2 transition-all cursor-pointer ${
                paymentMethod === 'COD'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-cream-dark/40 bg-white text-gray-400 hover:bg-cream/10'
              }`}
            >
              <Wallet size={24} />
              <div className="text-center">
                <span className="block text-xs font-bold">COD</span>
                <span className="text-[9px] text-gray-400">Bayar saat makanan diterima</span>
              </div>
            </button>

            {/* Transfer Bank button */}
            <button
              id="payment-transfer-button"
              type="button"
              onClick={() => setPaymentMethod('Transfer Bank')}
              className={`p-4 rounded-2xl border flex flex-col items-center space-y-2 transition-all cursor-pointer ${
                paymentMethod === 'Transfer Bank'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-cream-dark/40 bg-white text-gray-400 hover:bg-cream/10'
              }`}
            >
              <Landmark size={24} />
              <div className="text-center">
                <span className="block text-xs font-bold">Transfer Bank</span>
                <span className="text-[9px] text-gray-400 font-medium">Transfer ke rekening restoran</span>
              </div>
            </button>
          </div>

          {/* Bank Details Display */}
          {paymentMethod === 'Transfer Bank' && (
            <div className="bg-cream/40 p-4 rounded-2xl border border-cream-dark/50 mt-3 animate-fade-in text-xs text-gray-700 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">Informasi Rekening</span>
              <div className="grid grid-cols-3 gap-y-1.5">
                <span className="text-gray-400 font-medium">Bank:</span>
                <span className="col-span-2 font-bold text-gray-800">{settings?.bankName || 'Bank Central Asia (BCA)'}</span>
                
                <span className="text-gray-400 font-medium">No. Rekening:</span>
                <span className="col-span-2 font-mono font-bold text-primary select-all">
                  {settings?.bankAccountNumber || '8420994981'}
                </span>
                
                <span className="text-gray-400 font-medium">Atas Nama:</span>
                <span className="col-span-2 font-semibold text-gray-800">{settings?.bankAccountHolder || "D'Foria Kitchen Indonesia"}</span>
              </div>
              <p className="text-[10px] text-gray-400 pt-1.5 border-t border-cream-dark/20 leading-normal">
                Silakan lakukan transfer sesuai total tagihan. Simpan bukti transfer untuk divalidasi oleh kasir kami.
              </p>
            </div>
          )}
        </div>

        {/* Summary total & checkout button */}
        <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft space-y-3">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Subtotal Item ({cart.length})</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-green-600 font-medium">
              <span>Diskon Kupon</span>
              <span className="font-mono">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-800 pt-2.5 border-t border-cream/50">
            <span>Total Tagihan</span>
            <span className="font-mono text-primary text-base">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <button
          id="btn-submit-order"
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white text-xs font-semibold py-4 rounded-2xl shadow-soft flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memproses Pesanan Anda...</span>
            </>
          ) : (
            <>
              <span>Kirim & Konfirmasi Pesanan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
