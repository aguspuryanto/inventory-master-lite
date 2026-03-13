
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Products from './pages/ProductsEnhanced';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Auth from './components/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import { Product, Transaction } from './types';
import { db } from './services/db';
import { supabase } from './lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { ToastProvider } from './components/toast';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: crypto.randomUUID(), code: 'PRD001', name: 'Premium Arabica Coffee', barcode: '899123456001', purchasePrice: 45000, sellingPrice: 65000, stock: 45, category: 'Beverage', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), code: 'PRD002', name: 'Silk Road Tea', barcode: '899123456002', purchasePrice: 20000, sellingPrice: 35000, stock: 12, category: 'Beverage', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), code: 'PRD003', name: 'Organic Honey 500ml', barcode: '899123456003', purchasePrice: 75000, sellingPrice: 98000, stock: 5, category: 'Food', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), code: 'PRD004', name: 'Dark Chocolate Bar', barcode: '899123456004', purchasePrice: 15000, sellingPrice: 25000, stock: 120, category: 'Food', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), code: 'PRD005', name: 'Artisan Sourdough', barcode: '899123456005', purchasePrice: 18000, sellingPrice: 32000, stock: 2, category: 'Food', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Function to initialize products in Supabase
const initializeProducts = async (force = false) => {
  if (!supabase) {
    console.log(' Supabase client is null');
    return;
  }
  
  // console.log(' Starting initializeProducts, force:', force);
  
  try {
    // Test connection first
    // console.log(' Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error(' Connection test failed:', testError);
      console.error(' Test error details:', JSON.stringify(testError, null, 2));
      return;
    }
    
    // console.log(' Supabase connection OK, count query worked');
    
    // Check if products already exist (unless forced)
    // console.log(' Checking existing products...');
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, code, name');
    
    if (fetchError) {
      // console.error(' Error checking existing products:', fetchError);
      // console.error(' Fetch error details:', JSON.stringify(fetchError, null, 2));
      
      // Check if it's RLS issue
      if (fetchError.code === 'PGRST116') {
        console.log(' This might be an RLS (Row Level Security) issue');
        console.log(' Check your RLS policies in Supabase Dashboard');
      }
      return;
    }
    
    // console.log(' Raw existingProducts data:', existingProducts);
    // console.log(' Existing products found:', existingProducts?.length || 0);
    
    // If products already exist and not forced, don't insert
    if (!force && existingProducts && existingProducts.length > 0) {
      // console.log(' Products already initialized, found:', existingProducts.length);
      return;
    }
    
    // If forced, delete existing products first
    if (force && existingProducts && existingProducts.length > 0) {
      // console.log(' Force re-initializing: deleting existing products...');
      // console.log('Force re-initializing: deleting existing products...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', existingProducts.map(p => p.id));
      
      if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        console.error('Delete error details:', JSON.stringify(deleteError, null, 2));
        return;
      }
    }
    
    // console.log('Initializing products with data:', INITIAL_PRODUCTS.length);
    
    // Prepare products with correct field mapping
    const productsToInsert = INITIAL_PRODUCTS.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      barcode: p.barcode,
      purchase_price: p.purchasePrice,
      selling_price: p.sellingPrice,
      stock: p.stock,
      category: p.category,
      image_url: p.image_url || ''
    }));
    
    // Insert initial products
    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();
    
    if (error) {
      console.error('Error inserting products:', error);
      console.error('Insert error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Products initialized successfully:', data?.length || 0);
      console.log('Inserted products:', data?.map(p => ({ id: p.id, code: p.code, name: p.name })));
    }
  } catch (err) {
    console.error('Error initializing products:', err);
    console.error('Init error details:', JSON.stringify(err, null, 2));
  }
};

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'}
      `}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </NavLink>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(!!supabase);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize initial data to prevent unnecessary re-renders
  const initialData = useMemo(() => ({
    products: INITIAL_PRODUCTS,
    transactions: []
  }), []);

  const loadData = useMemo(() => async () => {
    if (supabase) {
      try {
        // Initialize products first
        await initializeProducts();
        
        const [dbProducts, dbTransactions] = await Promise.all([
          db.getProducts(),
          db.getTransactions()
        ]);
        
        // Always use data from Supabase if available
        setProducts(dbProducts);
        setTransactions(dbTransactions);
        
        // Log data source for debugging
        console.log('Products loaded from Supabase:', dbProducts.length);
        // console.log('Transactions loaded from Supabase:', dbTransactions.length);
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Fallback to initial data if Supabase fails
        setProducts(initialData.products);
        setTransactions(initialData.transactions);
        console.log('Fallback to initial products:', initialData.products.length);
      }
    } else {
      // Use initial data when Supabase is not configured
      setProducts(initialData.products);
      setTransactions(initialData.transactions);
      console.log('Using initial products (no Supabase):', initialData.products.length);
    }
    setIsLoading(false);
  }, [initialData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsAuthLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Sync products with stock changes from transactions
  const handleAddTransaction = async (newTx: Transaction) => {
    // Optimistic UI update
    setTransactions(prev => [newTx, ...prev]);
    
    // Note: With the new transaction structure, stock updates are handled
    // differently since transactions don't contain item details
    // You may need to implement separate stock management logic

    // Save to DB
    if (supabase) {
      try {
        await db.addTransaction(newTx);
      } catch (error) {
        console.error("Failed to save transaction to DB:", error);
        alert("Gagal menyimpan transaksi ke database.");
      }
    }
  };

  const handleAuthSuccess = (user: SupabaseUser) => {
    setSession({ user, access_token: '', refresh_token: '', expires_at: 0, expires_in: 0, token_type: 'bearer' });
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
    }
  };

  const isUserLoggedIn = supabase ? !!session : isAuthenticated;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return (
      <ToastProvider>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </ToastProvider>
    );
  }

  return (
    <HashRouter>
      <ToastProvider>
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${isDarkMode ? 'dark' : ''}`}>
          <div className="flex h-screen">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Package className="text-white h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  KasirKu
                </h1>
              </div>

              <nav className="space-y-2">
                <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem to="/products" icon={<Package size={20} />} label="Produk" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem to="/pos" icon={<ShoppingCart size={20} />} label="Kasir" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem to="/transactions" icon={<History size={20} />} label="Transaksi" onClick={() => setIsSidebarOpen(false)} />
                <SidebarItem to="/reports" icon={<FileText size={20} />} label="Laporan" onClick={() => setIsSidebarOpen(false)} />
              </nav>
            </div>
            
            <div className="absolute bottom-0 w-full p-6 border-t border-slate-100 dark:border-slate-700">
              {/* User profile moved to header */}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 lg:px-8 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
                >
                  <Menu size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 lg:text-xl">
                  {/* Dynamic Title logic could go here */}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>
                
                {/* User Profile - Moved from sidebar */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <User size={20} className="text-slate-400 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {session?.user?.user_metadata?.name || session?.user?.email || 'Admin Utama'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session?.user ? 'Kasir / Admin' : 'Super Admin'}
                    </p>
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

            <div className="flex-1 p-4 lg:p-8 overflow-y-auto relative bg-slate-50 dark:bg-slate-900">
              {!isSupabaseConfigured && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                  <div className="mt-0.5">⚠️</div>
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
                  <Route path="/pos" element={<POS products={products} onCheckout={handleAddTransaction} />} />
                  <Route path="/transactions" element={<Transactions transactions={transactions} />} />
                  <Route path="/reports" element={<Reports transactions={transactions} products={products} />} />
                </Routes>
              )}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  </HashRouter>
  );
};

export default App;
