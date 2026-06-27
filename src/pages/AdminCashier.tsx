/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Search 
} from 'lucide-react';
import { dbService } from '../lib/firebase';
import { MenuItem, StoreSettings, Coupon, Order } from '../types';
import AdminHeader from '../components/AdminHeader';

export default function AdminCashier() {
  const navigate = useNavigate();

  // Shared entity state
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Cashier Cart state
  const [cashierCart, setCashierCart] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);
  const [cashierQuery, setCashierQuery] = useState('');
  const [cashierCustomerName, setCashierCustomerName] = useState('');
  const [cashierTableNumber, setCashierTableNumber] = useState('');
  const [cashierCoupon, setCashierCoupon] = useState('');
  const [cashierDiscount, setCashierDiscount] = useState(0);

  // Initial Load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const fetchedMenus = await dbService.getMenus();
      const fetchedSettings = await dbService.getSettings();
      const fetchedCoupons = await dbService.getCoupons();

      setMenus(fetchedMenus);
      setSettings(fetchedSettings);
      setCoupons(fetchedCoupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!dbService.isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCashierCart = (item: MenuItem) => {
    setCashierCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateCashierQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setCashierCart(prev => prev.filter(c => c.menuItem.id !== menuItemId));
    } else {
      setCashierCart(prev => prev.map(c => c.menuItem.id === menuItemId ? { ...c, quantity: qty } : c));
    }
  };

  const handleApplyCashierCoupon = () => {
    if (!cashierCoupon.trim()) {
      setCashierDiscount(0);
      return;
    }
    const found = coupons.find(c => c.code.toLowerCase() === cashierCoupon.trim().toLowerCase() && c.active);
    if (!found) {
      alert('Kupon tidak valid atau sudah kedaluwarsa!');
      setCashierDiscount(0);
      return;
    }

    const subtotal = cashierCart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    if (found.discountType === 'percentage') {
      const computed = Math.round(subtotal * (found.discountValue / 100));
      setCashierDiscount(computed);
    } else {
      setCashierDiscount(found.discountValue);
    }
    alert(`Kupon diskon ${found.code} berhasil diterapkan!`);
  };

  const handleSaveCashierTransaction = async () => {
    if (cashierCart.length === 0) {
      alert('Silakan pilih minimal 1 menu terlebih dahulu!');
      return;
    }
    if (!cashierCustomerName.trim()) {
      alert('Silakan masukkan nama pelanggan!');
      return;
    }
    if (!cashierTableNumber.trim()) {
      alert('Silakan masukkan nomor meja atau "Takeaway"!');
      return;
    }

    const subtotal = cashierCart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    const finalAmount = Math.max(0, subtotal - cashierDiscount);

    const orderId = `CASH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      customerName: cashierCustomerName,
      tableNumber: cashierTableNumber,
      paymentMethod: 'Cash',
      notes: 'Transaksi langsung dari kasir.',
      status: 'Selesai', // Admin cashier purchases are immediately complete/paid
      totalAmount: finalAmount,
      createdAt: new Date().toISOString(),
      items: cashierCart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        image: c.menuItem.image,
        category: c.menuItem.category,
        quantity: c.quantity,
        notes: ''
      }))
    };

    try {
      await dbService.addOrder(newOrder);
      alert(`Transaksi ${orderId} berhasil disimpan dengan status SELESAI!`);
      // Reset
      setCashierCart([]);
      setCashierCustomerName('');
      setCashierTableNumber('');
      setCashierCoupon('');
      setCashierDiscount(0);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses transaksi kasir.');
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Top Admin Navigation Header */}
      <AdminHeader />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-cream-dark/30 shadow-soft"
          >
            <span>← Kembali ke Dashboard</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-serif italic text-sm text-gray-400">Menghubungkan ke pusat data D'Foria...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif font-bold text-2xl text-gray-800">Sistem Kasir Utama (Cashier)</h2>
              <p className="text-xs text-gray-400 mt-1">Input pesanan pelanggan langsung secara manual untuk pembayaran Tunai atau Debit di kasir.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menu catalog side */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-[20px] border border-cream-dark/30 shadow-soft">
                  <h3 className="font-serif font-bold text-gray-800 text-sm">Pilih Hidangan</h3>
                  <div className="relative flex-1 max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <Search size={15} />
                    </span>
                    <input
                      id="cashier-menu-search"
                      type="text"
                      placeholder="Cari hidangan untuk kasir..."
                      value={cashierQuery}
                      onChange={(e) => setCashierQuery(e.target.value)}
                      className="w-full bg-cream/10 text-gray-700 text-xs pl-10 pr-3 py-2 rounded-xl border border-cream-dark/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {menus.filter(m => m.name.toLowerCase().includes(cashierQuery.toLowerCase()) && m.available).map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleAddToCashierCart(item)}
                      className="bg-white p-3 rounded-2xl border border-cream-dark/20 hover:border-primary/50 cursor-pointer shadow-soft flex flex-col justify-between h-40 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded-xl bg-cream mb-2" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-serif font-bold text-xs text-gray-800 truncate">{item.name}</h4>
                        <p className="font-mono text-[11px] font-bold text-primary mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                  {menus.filter(m => m.name.toLowerCase().includes(cashierQuery.toLowerCase()) && m.available).length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-400 font-serif italic">Tidak ada menu tersedia.</div>
                  )}
                </div>
              </div>

              {/* Cashier cart billing side */}
              <div className="bg-white rounded-[24px] p-5 border border-cream-dark/30 shadow-soft flex flex-col justify-between h-fit space-y-4">
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-gray-800 border-b pb-2 text-sm flex items-center justify-between">
                    <span>Rincian Billing Kasir</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                      {cashierCart.length} Menu
                    </span>
                  </h3>

                  {/* Cart list */}
                  <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                    {cashierCart.map(c => (
                      <div key={c.menuItem.id} className="flex items-center justify-between text-xs bg-cream/25 p-2 rounded-xl border border-cream-dark/15">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-gray-700 truncate">{c.menuItem.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatPrice(c.menuItem.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateCashierQty(c.menuItem.id, c.quantity - 1)}
                            className="w-5 h-5 bg-white text-primary rounded-full shadow border flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-gray-700 w-4 text-center">{c.quantity}</span>
                          <button
                            onClick={() => handleAddToCashierCart(c.menuItem)}
                            className="w-5 h-5 bg-white text-primary rounded-full shadow border flex items-center justify-center font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    {cashierCart.length === 0 && (
                      <p className="text-xs text-gray-400 text-center italic py-10">Belum ada menu dipilih.</p>
                    )}
                  </div>

                  {/* Customer Info Form */}
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pelanggan</label>
                      <input
                        id="cashier-cust-name"
                        type="text"
                        required
                        placeholder="Nama pembeli..."
                        value={cashierCustomerName}
                        onChange={(e) => setCashierCustomerName(e.target.value)}
                        className="w-full bg-cream/10 px-3 py-2 rounded-xl border border-cream-dark/45 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor Meja / Takeaway</label>
                      <input
                        id="cashier-table-number"
                        type="text"
                        required
                        placeholder="Nomor meja..."
                        value={cashierTableNumber}
                        onChange={(e) => setCashierTableNumber(e.target.value)}
                        className="w-full bg-cream/10 px-3 py-2 rounded-xl border border-cream-dark/45 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary total */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Subtotal Belanja</span>
                    <span className="font-mono">{formatPrice(cashierCart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0))}</span>
                  </div>
                  {cashierDiscount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 font-medium">
                      <span>Diskon Kupon</span>
                      <span className="font-mono">-{formatPrice(cashierDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-800 border-t pt-2">
                    <span>Grand Total</span>
                    <span className="font-mono text-primary text-base">
                      {formatPrice(Math.max(0, cashierCart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0) - cashierDiscount))}
                    </span>
                  </div>

                  <button
                    id="btn-save-cashier-transaction"
                    onClick={handleSaveCashierTransaction}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3.5 rounded-xl shadow transition-all cursor-pointer text-center"
                  >
                    Simpan & Selesaikan Transaksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
