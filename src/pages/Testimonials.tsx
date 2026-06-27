import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Quote, Heart, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../lib/firebase';
import { Testimonial } from '../types';

export default function Testimonials() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await dbService.getTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error("Gagal memuat testimoni:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-24 text-gray-800">
      {/* 1. Elegant Top Header Bar */}
      <div className="sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur-md border-b border-cream-dark/30 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7B1E3A] hover:text-[#7B1E3A]/85 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </button>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#7B1E3A] px-2.5 py-1 rounded-full shadow-soft">
            D'Foria Kitchen
          </span>
        </div>
      </div>

      {/* 2. Page Intro Display */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="inline-flex p-3 rounded-full bg-[#7B1E3A]/5 text-[#7B1E3A] border border-[#7B1E3A]/10 mb-2">
            <MessageSquare size={24} className="text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-[#7B1E3A] tracking-wide">
            Testimoni Pelanggan Setia
          </h1>
          <div className="w-16 h-[2.5px] bg-[#D4AF37] mx-auto my-3 rounded-full"></div>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Kata-kata hangat, kritik membangun, dan saran dari Anda adalah semangat terbesar kami untuk terus menyajikan hidangan dengan cita rasa terbaik.
          </p>
        </motion.div>
      </div>

      {/* 3. Testimonial Cards Layout Grid */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-4 max-w-lg mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] p-5 border border-cream-dark/45 space-y-3 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/5"></div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] p-8 text-center border border-cream-dark/45 shadow-soft max-w-md mx-auto space-y-4"
          >
            <div className="text-gray-300 flex justify-center">
              <Quote size={48} className="opacity-30" />
            </div>
            <p className="font-serif italic text-sm text-gray-500">
              Belum ada testimoni yang dikirimkan. Jadilah yang pertama memberikan masukan setelah melakukan pemesanan!
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="inline-flex items-center justify-center bg-[#7B1E3A] hover:bg-[#7B1E3A]/90 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-soft cursor-pointer"
            >
              Pesan Menu Sekarang
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testi, idx) => (
              <motion.div
                key={testi.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                className="bg-white rounded-[20px] p-5 border border-cream-dark/45 shadow-soft hover:shadow-medium transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Subtle luxury top gold gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                
                {/* Decorative background quotation icon */}
                <div className="absolute top-4 right-4 text-[#7B1E3A]/5 group-hover:text-[#7B1E3A]/10 transition-colors pointer-events-none">
                  <Quote size={32} />
                </div>

                <div className="space-y-3 relative z-10">
                  {/* Testimonial message */}
                  <p className="text-xs text-gray-700 leading-relaxed font-medium italic whitespace-pre-line">
                    "{testi.message}"
                  </p>
                </div>

                {/* Sender info & Date */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-cream/50 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-[#7B1E3A]/5 border border-[#7B1E3A]/10 text-[#7B1E3A] rounded-full flex items-center justify-center">
                      <Heart size={12} className="fill-[#7B1E3A]" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                      {testi.customerName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-mono">
                    <Calendar size={11} />
                    <span>{formatDate(testi.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
