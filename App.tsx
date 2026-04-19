import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  FileText, 
  Menu, 
  X,
  Bell,
  User,
  Moon,
  Sun,
  LogOut,
  Smartphone,
  Monitor,
  Users
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Login from './pages/Login';
import RegisterStore from './pages/RegisterStore';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { Product, Transaction, TransactionItem } from './types';
import { db } from './services/db';
import { supabase } from './lib/supabase';
import { useDeviceDetect } from './hooks/useDeviceDetect';
import { Session } from '@supabase/supabase-js';
import MobileApp from './components/MobileApp';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <a 
      href={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </a>
  );
};

const AppContent: React.FC = () => {
  const { user, currentStore, logout, isLoading: authLoading } = useAuth();
  // console.log('user', user);
  // console.log('currentStore', currentStore);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [cart, setCart] = useState<TransactionItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(!!supabase);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isDesktop } = useDeviceDetect();

  useEffect(() => {
    const loadData = async () => {
      // console.log('_currentStore', currentStore);
      if (supabase && currentStore) {
        try {
          const [storeSettingsData, dbProducts, dbTransactions] = await Promise.all([
            db.getStoreSettings(currentStore.id),
            db.getProducts(currentStore.id),
            db.getTransactions(currentStore.id)
          ]);
          setStoreSettings(storeSettingsData);
          // console.log('Store Settings:', storeSettingsData);
          setProducts(dbProducts);
          // console.log('Products:', dbProducts);
          setTransactions(dbTransactions);
          // console.log('Transactions:', dbTransactions);
        } catch (error) {
          console.error("Error loading data from Supabase:", error);
        }
      }
      setIsLoading(false);
    };

    if (!authLoading && currentStore) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, currentStore]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddTransaction = async (newTx: Transaction) => {
    // Update local state
    setTransactions(prev => [newTx, ...prev]);
    
    // Update product stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const item = newTx.items.find(i => i.productId === p.id);
        if (item) {
          const stockChange = newTx.type === 'OUT' ? -item.quantity : item.quantity;
          return { ...p, stock: Math.max(0, p.stock + stockChange) };
        }
        return p;
      });
    });

    // Save to DB
    if (supabase && currentStore) {
      try {
        await db.addTransaction(newTx, currentStore.id);
      } catch (error) {
        console.error("Failed to save transaction to DB:", error);
        alert("Gagal menyimpan transaksi ke database.");
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterStore />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (isMobile) {
    return (
      <BrowserRouter>
        <MobileApp 
          products={products}
          setProducts={setProducts}
          transactions={transactions}
          setTransactions={setTransactions}
          cart={cart}
          setCart={setCart}
          onAddTransaction={handleAddTransaction}
          storeSettings={storeSettings}
          handleLogout={handleLogout}
        />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200 ${isDesktop ? 'gap-0' : ''}`}>
        {/* Sidebar */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200 dark:shadow-none">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">DTAKasir</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentStore?.name || 'POS System'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarItem to="/products" icon={<Package size={20} />} label="Produk" />
            <SidebarItem to="/pos" icon={<ShoppingCart size={20} />} label="Kasir" />
            <SidebarItem to="/transactions" icon={<History size={20} />} label="Transaksi" />
            <SidebarItem to="/reports" icon={<FileText size={20} />} label="Laporan" />
            {user?.is_owner && (
              <SidebarItem to="/user-management" icon={<Users size={20} />} label="Manajemen User" />
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {/* Dynamic Title logic could go here */}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="p-2 text-slate-500 dark:text-slate-400 flex items-center justify-center" 
                title={isMobile ? "Tampilan Mobile" : "Tampilan Desktop"}
              >
                {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
              </div>
              <button 
                className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {true ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link 
                    to="/settings" 
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group relative"
                    title={user?.full_name || user?.email || 'User'}
                  >
                    <User 
                      size={20} 
                      className="text-slate-400 dark:text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" 
                    />
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {user?.full_name || user?.email || 'User'}
                    </div>
                  </Link>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  title="Keluar"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 lg:p-8 flex-1 overflow-y-auto relative">
            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                <div className="mt-0.5">?</div>
                <div>
                  <p className="font-bold mb-1">Database Supabase Belum Dikonfigurasi</p>
                  <p>Aplikasi saat ini berjalan menggunakan data dummy di memori (perubahan akan hilang saat halaman direfresh). Untuk mengaktifkan penyimpanan permanen, tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di pengaturan Environment Variables.</p>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard products={products} transactions={transactions} />} />
                <Route path="/products" element={<Products products={products} setProducts={setProducts} onStockEntry={handleAddTransaction} />} />
                <Route path="/pos" element={<POS products={products} onCheckout={handleAddTransaction} cart={cart} setCart={setCart} />} />
                <Route path="/transactions" element={<Transactions transactions={transactions} />} />
                <Route path="/reports" element={<Reports transactions={transactions} products={products} />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/register" element={<RegisterStore />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
