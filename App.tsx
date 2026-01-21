
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  FileText, 
  Menu, 
  X,
  Bell,
  User
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
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
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
          : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'}
      `}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </NavLink>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
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
          
          <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Admin Utama</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:px-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-bold text-slate-800 lg:text-xl">
                {/* Dynamic Title logic could go here */}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
