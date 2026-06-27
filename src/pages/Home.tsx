/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  Compass, 
  MapPin, 
  MapPinned,
  Ticket, 
  Percent, 
  Heart, 
  ShieldCheck,
  ClipboardList,
  Settings
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { Banner, StoreSettings, Coupon, MenuItem } from '../types';
import HeroSlider from '../components/HeroSlider';
import PremiumInfoBar from '../components/PremiumInfoBar';

interface HomeProps {
  onAddCart: (item: MenuItem) => void;
}

export default function Home({ onAddCart }: HomeProps) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const FUNNY_GREETINGS = [
    "Lapar itu manusiawi, tapi kalau dibiarin kasihan ususmu lagi konser metal di dalam! 🎸",
    "Kata pepatah: 'Makanlah sebelum lapar'. Kata D'Foria: 'Makan aja terus, dietnya mulai besok subuh!' 🍕",
    "Perut keroncongan? Tenang, koki kami sudah bersertifikat internasional dalam meredakan konser dangdut di perutmu! 🎤",
    "Ada tiga hal yang bikin bahagia di dunia ini: Uang, Liburan, dan pesanan D'Foria sampai di meja Anda! 😍",
    "Cemburu itu berat, kamu nggak akan kuat. Mending berat badan aja yang naik gara-gara makanan lezat kami! ⚖️",
    "Status: Lagi nyari belahan jiwa yang bisa diajak mukbang bareng di D'Foria Kitchen. 💘",
    "Jangan biarkan masalah hidup membuatmu layu, mari segarkan harimu dengan masakan D'Foria yang wangi semerbak! 🍲",
    "Fakta ilmiah: 99% orang yang lapar akan langsung tersenyum manis setelah suapan pertama di D'Foria. 😉",
    "Punya masalah pelik? Cobain ganjel perut dulu di sini, kali aja solusinya ikut ketelen bareng nasi hangat! 🍚",
    "Muka glowing itu bonus, yang penting perut kenyang, dompet aman, dan hati damai sentosa! ✨",
    "Tips sehat hari ini: Kalau stres, makan. Kalau sedih, makan lagi. Hidup ini terlalu indah untuk dilewatkan dengan perut kosong! 🍗",
    "Dompet boleh tipis, tapi perut harus tetap tebal dengan makanan paling nikmat se-kecamatan! 😋",
    "Rasa rindu itu berat, tapi rindu masakan D'Foria jauh lebih berat dan satu-satunya cara mengobatinya adalah dengan checkout! 🛒"
  ];

  const [funnyGreeting, setFunnyGreeting] = useState('');

  const shuffleGreeting = () => {
    const randomIndex = Math.floor(Math.random() * FUNNY_GREETINGS.length);
    setFunnyGreeting(FUNNY_GREETINGS[randomIndex]);
  };

  useEffect(() => {
    shuffleGreeting();
    async function loadLobbyData() {
      try {
        const fetchedBanners = await dbService.getBanners();
        const fetchedSettings = await dbService.getSettings();
        const fetchedCoupons = await dbService.getCoupons();
        setBanners(fetchedBanners || []);
        setSettings(fetchedSettings);
        setCoupons((fetchedCoupons || []).filter(c => c && c.active));
      } catch (err) {
        console.error("Error loading lobby data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLobbyData();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const restaurantHighlights = [
    {
      icon: Heart,
      title: 'Cita Rasa Autentik',
      desc: 'Setiap resep diolah secara tradisional menggunakan bumbu segar pilihan untuk rasa legendaris.'
    },
    {
      icon: ShieldCheck,
      title: 'Higienis & Fresh',
      desc: 'Dapur modern berstandar kebersihan tinggi, menyajikan bahan masakan yang selalu baru setiap hari.'
    },
    {
      icon: Sparkles,
      title: 'Pelayanan Prima',
      desc: 'Keramahan tulus yang berkomitmen menyajikan kehangatan di setiap porsi pesanan Anda.'
    }
  ];

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto animate-fade-in space-y-6">
      {/* 1. Premium Info Bar at the very top */}
      <PremiumInfoBar settings={settings} />

      {/* 2. Atmosphere Gallery & Banner Highlights (with subtle shimmer) */}
      <div className="relative rounded-[24px] overflow-hidden shadow-medium border border-cream-dark/50">
        <HeroSlider banners={banners} />
      </div>

      {/* 3. Main Welcome / Digital Lobby Entrance Card (Glassmorphism + Premium CTA) */}
      <div className="bg-white/70 backdrop-blur-md rounded-[26px] border border-cream-dark/60 p-6 shadow-medium space-y-5 text-center relative overflow-hidden animate-slide-up">
        {/* Subtle luxury gold gradient line at the top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        
        {/* Subtle background glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Brand visual badge */}
        <div className="mx-auto w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] animate-glow-pulse animate-shimmer border border-[#D4AF37]/25">
          <Compass size={22} />
        </div>

        {/* Lobby welcome text */}
        <div className="space-y-2.5">
          <h2 className="font-serif text-2xl font-extrabold text-gray-800 tracking-tight leading-tight">
            Selamat Datang di <br />
            <span className="animate-text-shimmer">D'Foria Kitchen</span>
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[92%] mx-auto">
            Nikmati pengalaman kuliner terbaik dengan cita rasa istimewa, suasana nyaman, dan pelayanan terbaik untuk setiap momen Anda.
          </p>
        </div>

        {/* Dynamic Funny Greeting speech bubble */}
        {funnyGreeting && (
          <div className="bg-primary/[0.04] hover:bg-primary/[0.06] border border-primary/10 rounded-2xl p-4 text-left relative transition-all duration-300">
            <button
              type="button"
              id="btn-shuffle-greeting"
              onClick={shuffleGreeting}
              className="absolute top-2.5 right-2.5 p-1 text-primary/45 hover:text-primary transition-colors cursor-pointer bg-white rounded-full border border-cream-dark/30 shadow-soft"
              title="Ganti kutipan lucu"
            >
              <Sparkles size={11} className="animate-pulse" />
            </button>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary">📢 Humor Lapar Hari Ini</span>
            </div>
            <p className="text-[10.5px] font-medium text-gray-600 italic leading-relaxed pr-5">
              "{funnyGreeting}"
            </p>
          </div>
        )}

        {/* Premium CTA and Instructions */}
        <div className="space-y-3 pt-2">
          <button
            id="btn-lobby-to-menu"
            onClick={() => navigate('/menu')}
            className="w-full bg-primary hover:bg-primary-dark text-cream-light font-bold text-sm py-3.5 px-6 rounded-xl shadow-button hover-lift btn-scale flex items-center justify-center space-x-2 cursor-pointer transition-all duration-300"
          >
            <span>Lihat Menu</span>
            <ChevronRight size={16} className="animate-pulse" />
          </button>
          
          <p className="text-[10px] font-medium text-gray-400 italic pt-1">
            Silakan masuk dan jelajahi hidangan favorit Anda.
          </p>
        </div>
      </div>

      {/* 4. Keunggulan Kami (Introduction to Restaurant Atmosphere) */}
      <div className="space-y-4 animate-slide-up">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <h3 className="font-serif text-sm font-bold text-gray-800 uppercase tracking-wider">Keunggulan D'Foria</h3>
        </div>

        <div className="space-y-3">
          {restaurantHighlights.map((hl, i) => {
            const Icon = hl.icon;
            return (
              <div 
                key={i} 
                className="bg-white/55 backdrop-blur-[2px] rounded-2xl p-4 border border-cream-dark/40 flex items-start space-x-3.5 shadow-soft hover-lift transition-all duration-300"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5">
                  <Icon size={16} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xs font-bold text-gray-800">{hl.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{hl.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Active Promotions & Coupons Panel */}
      {coupons.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket size={16} className="text-primary" />
              <h3 className="font-serif text-sm font-bold text-gray-800 uppercase tracking-wider">Promo & Voucher Aktif</h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">Spesial</span>
          </div>

          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div 
                key={coupon.id}
                className="bg-white rounded-2xl p-4 border border-cream-dark/45 flex items-center justify-between gap-4 relative overflow-hidden group shadow-soft"
              >
                {/* Subtle luxury gold gradient line at the top of card */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg pointer-events-none"></div>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-primary text-cream-light flex items-center justify-center animate-glow-pulse">
                    <Percent size={16} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-mono text-xs font-bold text-primary tracking-wider">{coupon.code}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      Potongan {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rp ${coupon.discountValue.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      Min. Pembelian Rp {((coupon as any).minPurchase || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <button
                  id={`btn-copy-coupon-${coupon.id}`}
                  onClick={() => handleCopyCoupon(coupon.code)}
                  className={`text-[10px] font-bold px-3 py-2 rounded-xl border transition-all duration-300 btn-scale ${
                    copiedCode === coupon.code 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/40'
                  }`}
                >
                  {copiedCode === coupon.code ? 'Tersalin!' : 'Salin Kode'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Restoran Info Footer Section */}
      <div className="bg-white/75 backdrop-blur-md border border-cream-dark/50 rounded-[24px] p-5 text-center space-y-3 shadow-medium relative overflow-hidden">
        {/* Subtle luxury gold gradient line at the top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/5 rounded-full blur-lg pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary">
            <MapPinned size={18} className="animate-bounce text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider font-serif">LOKASI KAMI</span>
          </div>
          
          <div className="space-y-1 max-w-[85%] mx-auto text-center">
            <h4 className="font-serif font-extrabold text-sm text-primary tracking-wide">
              {settings?.storeName || "D'Foria Kitchen"}
            </h4>
            <p className="text-xs text-gray-800 font-bold leading-tight">
              {settings?.locationCity || "Pulau Weh - Kota Sabang"}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              {settings?.locationProvince || "Aceh, Indonesia"}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            <a 
              href={settings?.mapsUrl || "https://www.google.com/maps/search/?api=1&query=Pulau+Weh+Kota+Sabang+Aceh"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              <MapPinned size={11} className="text-[#D4AF37]" />
              <span>Lihat di Maps</span>
            </a>

            <button
              onClick={() => navigate('/testimoni')}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-cream-light/60 text-primary border border-primary/40 hover:border-primary font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shadow-soft transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <span className="text-[#D4AF37]">❤️</span>
              <span>Testimoni</span>
            </button>
          </div>

          <div className="pt-2.5 border-t border-cream-dark/30 text-[9px] flex items-center justify-center space-x-2 font-mono text-gray-400">
            <span>Operasional:</span>
            <span className="font-bold text-primary">{settings?.openingHour || '08:00'} - {settings?.closingHour || '22:00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
