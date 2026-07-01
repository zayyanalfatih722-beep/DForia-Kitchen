import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Calendar, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../lib/firebase';
import { Testimonial } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminTestimonials() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const data = await dbService.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("Gagal mengambil data testimoni:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    fetchTestimonials();
  }, [navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Gagal menghapus testimoni:", err);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(term) ||
      t.message.toLowerCase().includes(term)
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-[#F5F1E8] min-h-[100dvh] h-auto pb-24 text-gray-800">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#7B1E3A]">
              Testimoni Pelanggan
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Pantau, cari, dan kelola semua ulasan, kritik, dan saran dari pelanggan setia.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-1 px-4 py-2 bg-white hover:bg-cream-light/60 text-xs font-bold text-[#7B1E3A] border border-cream-dark/50 rounded-xl shadow-soft transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Menyegarkan...' : 'Segarkan Data'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[20px] p-4 mb-6 border border-cream-dark/40 shadow-soft">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pelanggan atau isi testimoni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-cream/30 border border-cream-dark/45 focus:border-[#7B1E3A] focus:ring-1 focus:ring-[#7B1E3A] rounded-xl text-xs placeholder:text-gray-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Content Display Area */}
        {loading ? (
          <div className="bg-white rounded-[20px] p-12 text-center border border-cream-dark/40 shadow-soft">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B1E3A] mx-auto mb-4"></div>
            <p className="text-xs text-gray-500 font-medium">Memuat testimoni...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-[20px] py-12 px-6 text-center border border-cream-dark/40 shadow-soft max-w-md mx-auto">
            <MessageSquare size={44} className="text-[#D4AF37] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif font-bold text-sm text-gray-800 mb-1">
              Tidak Ada Testimoni
            </h3>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-relaxed">
              {searchTerm
                ? `Tidak ditemukan testimoni yang cocok dengan pencarian "${searchTerm}".`
                : 'Belum ada testimoni pelanggan yang masuk.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-bold text-[#7B1E3A] hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestimonials.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[20px] p-5 border border-cream-dark/40 shadow-soft hover:shadow-medium transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wide text-gray-800">
                        {t.customerName}
                      </h4>
                      <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-0.5 font-mono">
                        <Calendar size={10} />
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Testimoni"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed italic bg-cream/20 p-3 rounded-xl border border-cream-dark/15 whitespace-pre-line">
                    "{t.message}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-medium border border-cream-dark text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-red-600"></div>

              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle size={22} className="animate-pulse" />
              </div>

              <h3 className="font-serif text-base font-bold text-gray-800 mb-2">
                Hapus Testimoni ini?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Tindakan ini tidak dapat dibatalkan. Testimoni pelanggan ini akan dihapus secara permanen dari server.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
