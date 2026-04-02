import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Package, ShoppingCart, History, User, 
  Bell, Moon, Sun, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Plus, Search, ChevronRight, LogOut,
  ScanLine, Minus, X
} from 'lucide-react';
import { Product, Transaction, TransactionItem } from '../types';
import { formatCurrency, generateId, parseFormattedNumber } from '../utils';
import { Session } from '@supabase/supabase-js';

// --- MODULAR COMPONENTS ---

export const MobileHeader = ({ title, isDarkMode, setIsDarkMode }: any) => (
  <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200 dark:shadow-none">
        <User size={20} />
      </div>
      <div>
        <h1 className="text-sm font-black text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Utama</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-full active:scale-95 transition-transform">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button className="p-2.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-full relative active:scale-95 transition-transform">
        <Bell size={18} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
      </button>
    </div>
  </header>
);

export const BottomNav = () => {
  const navItems = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/products', icon: <Package size={22} />, label: 'Produk' },
    { to: '/pos', icon: <ShoppingCart size={24} />, label: 'Kasir', isFab: true },
    { to: '/transactions', icon: <History size={22} />, label: 'Riwayat' },
    { to: '/profile', icon: <User size={22} />, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-6 pt-2 px-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pointer-events-auto">
        <div className="flex items-center justify-between relative">
          {navItems.map((item, idx) => {
            if (item.isFab) {
              return (
                <div key={idx} className="relative -top-8">
                  <NavLink to={item.to} className={({isActive}) => `flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl shadow-purple-300/50 dark:shadow-purple-900/50 transform transition-all active:scale-95 ${isActive ? 'ring-4 ring-purple-100 dark:ring-purple-900/50 scale-105' : ''}`}>
                    {item.icon}
                  </NavLink>
                </div>
              );
            }
            return (
              <NavLink key={idx} to={item.to} className={({isActive}) => `flex flex-col items-center gap-1.5 p-2 transition-colors ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                {({ isActive }) => (
                  <>
                    {React.cloneElement(item.icon, { strokeWidth: isActive ? 2.5 : 2 })}
                    <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CardSummary = ({ title, amount, trend, isPositive, icon }: any) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
        {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{title}</p>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{amount}</h3>
    </div>
  </div>
);

export const TransactionList = ({ transactions }: { transactions: Transaction[] }) => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-slate-800 dark:text-slate-100">Transaksi Terakhir</h3>
      <button className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-3 py-1.5 rounded-full">Lihat Semua</button>
    </div>
    <div className="space-y-4">
      {transactions.slice(0, 5).map(t => (
        <div key={t.id} className="flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'IN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
              {t.type === 'IN' ? <ArrowDownRight size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.type === 'IN' ? 'Barang Masuk' : 'Penjualan'}</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-black ${t.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {t.type === 'IN' ? '-' : '+'}Rp {formatCurrency(t.total)}
            </p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{t.items.length} item</p>
          </div>
        </div>
      ))}
      {transactions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <History className="text-slate-300 dark:text-slate-600" size={24} />
          </div>
          <p className="text-sm font-medium text-slate-400">Belum ada transaksi</p>
        </div>
      )}
    </div>
  </div>
);

// --- PAGES ---

const MobileDashboard = ({ products, transactions }: any) => {
  const totalStock = products.reduce((acc: number, p: Product) => acc + p.stock, 0);
  const totalSales = transactions.filter((t: Transaction) => t.type === 'OUT').reduce((acc: number, t: Transaction) => acc + t.total, 0);
  const totalIncoming = transactions.filter((t: Transaction) => t.type === 'IN').reduce((acc: number, t: Transaction) => acc + t.total, 0);

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Primary Gradient Card */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-200 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <p className="text-purple-100 text-sm font-medium mb-1">Total Pendapatan</p>
          <h2 className="text-3xl font-black mb-6 tracking-tight">Rp {formatCurrency(totalSales)}</h2>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 flex-1 border border-white/10">
              <p className="text-purple-100 text-[10px] font-bold uppercase tracking-wider mb-1">Pengeluaran</p>
              <p className="font-bold text-sm">Rp {formatCurrency(totalIncoming)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 flex-1 border border-white/10">
              <p className="text-purple-100 text-[10px] font-bold uppercase tracking-wider mb-1">Total Stok</p>
              <p className="font-bold text-sm">{totalStock} Unit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CardSummary 
          title="Penjualan" 
          amount={transactions.filter((t: Transaction) => t.type === 'OUT').length.toString()} 
          trend="+12%" 
          isPositive={true} 
          icon={<TrendingUp size={24} strokeWidth={2.5} />} 
        />
        <CardSummary 
          title="Produk" 
          amount={products.length.toString()} 
          trend="Aman" 
          isPositive={true} 
          icon={<Package size={24} strokeWidth={2.5} />} 
        />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
};

const MobileProducts = ({ products }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari produk..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((p: Product) => (
          <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-lg">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{p.name}</h4>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{p.category} • Stok: {p.stock}</p>
              <p className="text-sm font-black text-purple-600 dark:text-purple-400">Rp {formatCurrency(p.sellingPrice)}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 active:scale-95 transition-transform">
              <ChevronRight size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-xl shadow-purple-300/50 flex items-center justify-center active:scale-95 transition-transform z-40">
        <Plus size={24} strokeWidth={3} />
      </button>
    </div>
  );
};

const MobilePOS = ({ products, onCheckout }: any) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0);
  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = () => {
    const newTx: Transaction = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: 'OUT',
      items: [...cart],
      total,
      paymentAmount: total,
      changeAmount: 0
    };
    onCheckout(newTx);
    setCart([]);
    setIsCheckoutOpen(false);
    alert('Transaksi Berhasil!');
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari barang untuk dijual..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pb-32">
        {filtered.map((p: Product) => (
          <div key={p.id} onClick={() => addToCart(p)} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 active:scale-95 transition-transform cursor-pointer">
            <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mb-3">
              <Package className="text-slate-300 dark:text-slate-500" size={32} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs line-clamp-2 mb-1">{p.name}</h4>
            <p className="text-sm font-black text-purple-600 dark:text-purple-400">Rp {formatCurrency(p.sellingPrice)}</p>
          </div>
        ))}
      </div>

      {/* Floating Cart Summary */}
      {cart.length > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-24 left-5 right-5 z-40 max-w-md mx-auto">
          <div onClick={() => setIsCheckoutOpen(true)} className="bg-slate-900 dark:bg-purple-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((a,b)=>a+b.quantity,0)}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-300 dark:text-purple-200">Total Tagihan</p>
                <p className="font-bold">Rp {formatCurrency(total)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm">
              Bayar <ChevronRight size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Bottom Sheet */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Keranjang ({cart.length})</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.name}</h5>
                    <p className="text-purple-600 dark:text-purple-400 font-bold text-sm">Rp {formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded-2xl">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-600 dark:text-slate-300">
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center dark:text-slate-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-600 dark:text-slate-300">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">Rp {formatCurrency(total)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-none active:scale-95 transition-transform">
                Proses Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileProfile = ({ session, handleLogout }: any) => {
  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-purple-200 dark:shadow-none mb-4">
          <User size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">Admin Utama</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">{session?.user?.email || 'admin@invmaster.com'}</p>
        
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold active:scale-95 transition-transform">
          <LogOut size={20} />
          Keluar Akun
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors cursor-pointer">
          <span className="font-bold text-slate-700 dark:text-slate-200">Pengaturan Toko</span>
          <ChevronRight className="text-slate-400" size={20} />
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors cursor-pointer">
          <span className="font-bold text-slate-700 dark:text-slate-200">Laporan Lengkap</span>
          <ChevronRight className="text-slate-400" size={20} />
        </div>
        <div className="p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors cursor-pointer">
          <span className="font-bold text-slate-700 dark:text-slate-200">Bantuan & Dukungan</span>
          <ChevronRight className="text-slate-400" size={20} />
        </div>
      </div>
    </div>
  );
};

// --- MAIN MOBILE APP CONTAINER ---

interface MobileAppProps {
  products: Product[];
  setProducts: any;
  transactions: Transaction[];
  handleAddTransaction: (tx: Transaction) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  session: Session | null;
  handleLogout: () => void;
}

const MobileApp: React.FC<MobileAppProps> = ({ 
  products, setProducts, transactions, handleAddTransaction, 
  isDarkMode, setIsDarkMode, session, handleLogout 
}) => {
  const location = useLocation();
  
  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path === '/products') return 'Produk';
    if (path === '/pos') return 'Kasir POS';
    if (path === '/transactions') return 'Riwayat';
    if (path === '/profile') return 'Profil Saya';
    return 'InvMaster';
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 relative shadow-2xl overflow-hidden flex flex-col font-sans selection:bg-purple-200 dark:selection:bg-purple-900">
      <MobileHeader title={getPageTitle(location.pathname)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-28 scroll-smooth">
        <Routes>
          <Route path="/" element={<MobileDashboard products={products} transactions={transactions} />} />
          <Route path="/products" element={<MobileProducts products={products} setProducts={setProducts} onStockEntry={handleAddTransaction} />} />
          <Route path="/pos" element={<MobilePOS products={products} onCheckout={handleAddTransaction} />} />
          <Route path="/transactions" element={<div className="p-5"><TransactionList transactions={transactions} /></div>} />
          <Route path="/profile" element={<MobileProfile session={session} handleLogout={handleLogout} />} />
          {/* Fallback for reports route if accessed */}
          <Route path="/reports" element={<MobileProfile session={session} handleLogout={handleLogout} />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
};

export default MobileApp;
