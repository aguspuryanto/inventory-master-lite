
import React, { useState, useEffect } from 'react';
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
import Products from './pages/Products';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import { Product, Transaction } from './types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: 'BRG001', name: 'Premium Arabica Coffee', barcode: '899123456001', purchasePrice: 45000, sellingPrice: 65000, stock: 45, category: 'Beverage' },
  { id: '2', code: 'BRG002', name: 'Silk Road Tea', barcode: '899123456002', purchasePrice: 20000, sellingPrice: 35000, stock: 12, category: 'Beverage' },
  { id: '3', code: 'BRG003', name: 'Organic Honey 500ml', barcode: '899123456003', purchasePrice: 75000, sellingPrice: 98000, stock: 5, category: 'Food' },
  { id: '4', code: 'BRG004', name: 'Dark Chocolate Bar', barcode: '899123456004', purchasePrice: 15000, sellingPrice: 25000, stock: 120, category: 'Food' },
  { id: '5', code: 'BRG005', name: 'Artisan Sourdough', barcode: '899123456005', purchasePrice: 18000, sellingPrice: 32000, stock: 2, category: 'Food' },
];

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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
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
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  if (!isAuthenticated) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Package className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                InvMaster
              </h1>
            </div>

            <nav className="space-y-2">
              <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/products" icon={<Package size={20} />} label="Manajemen Barang" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/pos" icon={<ShoppingCart size={20} />} label="Kasir" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/transactions" icon={<History size={20} />} label="Riwayat Transaksi" onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/reports" icon={<FileText size={20} />} label="Laporan" onClick={() => setIsSidebarOpen(false)} />
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-full p-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <User size={20} className="text-slate-400 dark:text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Admin Utama</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                </div>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
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
            </div>
          </header>

          <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard products={products} transactions={transactions} />} />
              <Route path="/products" element={<Products products={products} setProducts={setProducts} onStockEntry={(tx) => handleAddTransaction(tx)} />} />
              <Route path="/pos" element={<POS products={products} onCheckout={handleAddTransaction} />} />
              <Route path="/transactions" element={<Transactions transactions={transactions} />} />
              <Route path="/reports" element={<Reports transactions={transactions} products={products} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
