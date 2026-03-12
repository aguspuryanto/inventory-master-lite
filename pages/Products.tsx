
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Barcode, 
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  Package,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  HardDrive
} from 'lucide-react';
import { Product, Transaction } from '../types';
import { formatCurrency, parseFormattedNumber, generateId } from '../utils';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';
import { LocalStorageService } from '../services/local-storage';
import { useOnlineStatus } from '../hooks/use-online-status';
import { useToast } from '../components/toast';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onStockEntry: (tx: Transaction) => void;
}

const Products: React.FC<ProductsProps> = ({ products, setProducts, onStockEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const onlineStatus = useOnlineStatus();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    barcode: '',
    purchasePrice: '0',
    sellingPrice: '0',
    stock: '0',
    category: ''
  });

  const handleOpenModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setFormData({
        code: p.code,
        name: p.name,
        barcode: p.barcode,
        purchasePrice: formatCurrency(p.purchasePrice),
        sellingPrice: formatCurrency(p.sellingPrice),
        stock: p.stock.toString(),
        category: p.category
      });
    } else {
      setEditingProduct(null);
      setFormData({
        code: `BRG${Math.floor(Math.random() * 900) + 100}`,
        name: '',
        barcode: '',
        purchasePrice: '0',
        sellingPrice: '0',
        stock: '0',
        category: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : generateId(),
      code: formData.code,
      name: formData.name,
      barcode: formData.barcode,
      purchasePrice: parseFormattedNumber(formData.purchasePrice),
      sellingPrice: parseFormattedNumber(formData.sellingPrice),
      stock: parseInt(formData.stock),
      category: formData.category,
      image_url: '', // Default empty string
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        // Update existing product
        if (isOnlineMode && supabase) {
          try {
            await db.updateProduct(productData);
          } catch (dbError) {
            console.error('Database update error:', dbError);
            addToast({
              type: 'error',
              title: 'Gagal update di database',
              message: dbError instanceof Error ? dbError.message : 'Terjadi kesalahan saat update produk di Supabase'
            });
            return;
          }
        }
        
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
        
        // If stock increased manually, track as IN transaction
        if (productData.stock > editingProduct.stock) {
          const diff = productData.stock - editingProduct.stock;
          onStockEntry({
            id: generateId(),
            type: 'IN',
            mainCategory: 'Stok Masuk Manual',
            subCategory: 'Penyesuaian',
            amount: diff,
            createdAt: new Date().toISOString(),
            description: `Penyesuaian stok ${productData.name}`
          });
        }
        
        addToast({
          type: 'success',
          title: 'Produk berhasil diperbarui',
          message: `${productData.name} telah diupdate`
        });
      } else {
        // Add new product
        if (isOnlineMode && supabase) {
          try {
            await db.addProduct(productData);
          } catch (dbError) {
            console.error('Database add error:', dbError);
            addToast({
              type: 'error',
              title: 'Gagal simpan di database',
              message: dbError instanceof Error ? dbError.message : 'Terjadi kesalahan saat simpan produk di Supabase'
            });
            return;
          }
        }
        
        setProducts(prev => [...prev, productData]);
        
        // Track initial stock as IN transaction if > 0
        if (productData.stock > 0) {
          onStockEntry({
            id: generateId(),
            type: 'IN',
            mainCategory: 'Stok Awal',
            subCategory: 'Produk Baru',
            amount: productData.stock,
            createdAt: new Date().toISOString(),
            description: `Stok awal ${productData.name}`
          });
        }
        
        addToast({
          type: 'success',
          title: 'Produk berhasil ditambahkan',
          message: `${productData.name} telah ditambahkan`
        });
      }
      
      // Save to local storage
      const updatedProducts = editingProduct 
        ? products.map(p => p.id === editingProduct.id ? productData : p)
        : [...products, productData];
      LocalStorageService.saveProducts(updatedProducts);
      
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      addToast({
        type: 'error',
        title: 'Gagal menyimpan barang',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data produk'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus barang ini?')) {
      try {
        if (isOnlineMode && supabase) {
          await db.deleteProduct(id);
        }
        setProducts(prev => prev.filter(p => p.id !== id));
        
        // Save to local storage
        const updatedProducts = products.filter(p => p.id !== id);
        LocalStorageService.saveProducts(updatedProducts);
        
        addToast({
          type: 'success',
          title: 'Berhasil menghapus barang',
          message: 'Produk telah dihapus dari sistem'
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast({
          type: 'error',
          title: 'Gagal menghapus barang',
          message: 'Terjadi kesalahan saat menghapus data produk'
        });
      }
    }
  };

  // Sync functions
  const syncToSupabase = async () => {
    if (!onlineStatus.isSupabaseAvailable) {
      addToast({
        type: 'error',
        title: 'Tidak ada koneksi',
        message: 'Tidak dapat terhubung ke Supabase'
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Sinkronisasi...');

    try {
      const localProducts = LocalStorageService.loadProducts();
      
      for (const product of localProducts) {
        await db.addProduct(product);
      }

      // Refresh products from Supabase
      const freshProducts = await db.getProducts();
      setProducts(freshProducts);
      
      addToast({
        type: 'success',
        title: 'Sinkronisasi berhasil',
        message: `${localProducts.length} produk berhasil disinkronkan`
      });
    } catch (error) {
      console.error('Sync error:', error);
      addToast({
        type: 'error',
        title: 'Sinkronisasi gagal',
        message: 'Terjadi kesalahan saat menyinkronkan data'
      });
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const syncFromSupabase = async () => {
    if (!onlineStatus.isSupabaseAvailable) {
      addToast({
        type: 'error',
        title: 'Tidak ada koneksi',
        message: 'Tidak dapat terhubung ke Supabase'
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Mengunduh data...');

    try {
      const onlineProducts = await db.getProducts();
      setProducts(onlineProducts);
      LocalStorageService.saveProducts(onlineProducts);
      
      addToast({
        type: 'success',
        title: 'Data berhasil diunduh',
        message: `${onlineProducts.length} produk berhasil diunduh dari server`
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        type: 'error',
        title: 'Pengunduhan gagal',
        message: 'Terjadi kesalahan saat mengunduh data dari server'
      });
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const exportToJSON = () => {
    LocalStorageService.exportToJSON(products);
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    LocalStorageService.importFromJSON(file)
      .then(importedProducts => {
        setProducts(importedProducts);
        LocalStorageService.saveProducts(importedProducts);
        alert(`Berhasil mengimpor ${importedProducts.length} produk`);
      })
      .catch(error => {
        alert(error.message);
      });

    // Reset file input
    event.target.value = '';
  };

  const toggleMode = () => {
    if (!isOnlineMode && onlineStatus.isSupabaseAvailable) {
      // Switching to online mode - sync from Supabase
      syncFromSupabase();
    }
    setIsOnlineMode(!isOnlineMode);
  };

  // Initialize data based on mode
  useEffect(() => {
    if (isOnlineMode && onlineStatus.isSupabaseAvailable) {
      // Online mode: load from Supabase
      db.getProducts().then(setProducts).catch(console.error);
    } else {
      // Offline mode: load from local storage
      const localProducts = LocalStorageService.loadProducts();
      if (localProducts.length > 0) {
        setProducts(localProducts);
      }
    }
  }, [isOnlineMode, onlineStatus.isSupabaseAvailable]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Produk</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola master data produk dan stok inventaris</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isOnlineMode 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              {isOnlineMode ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnlineMode ? 'Online' : 'Offline'}
            </button>
            {!onlineStatus.isSupabaseAvailable && (
              <span className="text-xs text-rose-500 dark:text-rose-400">No Connection</span>
            )}
            {syncStatus && (
              <span className="text-xs text-purple-600 dark:text-purple-400 animate-pulse">
                {syncStatus}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Export/Import */}
          <button 
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importFromJSON}
              className="hidden"
            />
          </label>

          {/* Sync buttons */}
          {onlineStatus.isSupabaseAvailable && (
            <>
              {!isOnlineMode && (
                <button 
                  onClick={syncToSupabase}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                >
                  <Database size={18} />
                  {isSyncing ? 'Menyinkron...' : 'Sync ke Server'}
                </button>
              )}
              {isOnlineMode && (
                <button 
                  onClick={syncFromSupabase}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} />
                  {isSyncing ? 'Mengunduh...' : 'Refresh dari Server'}
                </button>
              )}
              
              {/* Force Initialize Button */}
              <button 
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin me-reset semua data produk ke data awal? Data yang ada akan dihapus.')) {
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <HardDrive size={18} />
                Reset Data Awal
              </button>
            </>
          )}

          {/* Add product button */}
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none transition-all"
          >
            <Plus size={18} />
            Tambah Barang
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, kode, atau barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              <Filter size={18} />
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold uppercase">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">{p.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{p.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Barcode size={14} />
                      <span className="text-sm font-mono">{p.barcode || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Rp {formatCurrency(p.sellingPrice)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Profit: Rp {formatCurrency(p.sellingPrice - p.purchasePrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.stock <= 5 ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
                      p.stock <= 15 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {p.category}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="text-slate-200 dark:text-slate-700" size={64} />
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Tidak ada barang yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Kode Barang</label>
                  <input 
                    required 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Barcode</label>
                  <input 
                    value={formData.barcode} 
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                    placeholder="Scan atau ketik barcode..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Barang</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Harga Beli</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                    <input 
                      required 
                      value={formData.purchasePrice} 
                      onChange={e => setFormData({...formData, purchasePrice: formatCurrency(parseFormattedNumber(e.target.value))})}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                    <input 
                      required 
                      value={formData.sellingPrice} 
                      onChange={e => setFormData({...formData, sellingPrice: formatCurrency(parseFormattedNumber(e.target.value))})}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Stok</label>
                  <input 
                    type="number"
                    required 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Kategori</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Food">Food</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Electronic">Electronic</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 dark:shadow-none transition-all"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
