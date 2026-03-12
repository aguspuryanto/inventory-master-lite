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
  HardDrive,
  Image as ImageIcon
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
    category: '',
    image_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Real-time subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        console.log('Real-time product change:', payload);
        
        // Refresh products when there are changes
        db.getProducts().then(freshProducts => {
          setProducts(freshProducts);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        category: p.category,
        image_url: p.image_url || ''
      });
      setImagePreview(p.image_url || '');
    } else {
      setEditingProduct(null);
      setFormData({
        code: `PRD${Math.floor(Math.random() * 900) + 100}`,
        name: '',
        barcode: '',
        purchasePrice: '0',
        sellingPrice: '0',
        stock: '0',
        category: '',
        image_url: ''
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      
      // Upload to Supabase Storage
      const { error, data } = await supabase.storage
        .from('product-images')
        .upload(`public/${Date.now()}-${file.name}`, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setImagePreview(publicUrl);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      addToast({
        type: 'success',
        title: 'Upload Berhasil',
        message: 'Gambar produk berhasil diunggah'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      addToast({
        type: 'error',
        title: 'Upload Gagal',
        message: error instanceof Error ? error.message : 'Gagal mengunggah gambar'
      });
    } finally {
      setUploadingImage(false);
    }
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
      image_url: formData.image_url,
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Produk</h1>
            <p className="text-slate-500 dark:text-slate-400">Kelola master data produk dan stok inventaris</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsOnlineMode(!isOnlineMode)}
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
              onClick={() => LocalStorageService.exportToJSON(products)}
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  LocalStorageService.importFromJSON(file)
                    .then(importedProducts => {
                      setProducts(importedProducts);
                      LocalStorageService.saveProducts(importedProducts);
                      addToast({
                        type: 'success',
                        title: 'Import berhasil',
                        message: `${importedProducts.length} produk berhasil diimpor`
                      });
                    })
                    .catch(error => {
                      addToast({
                        type: 'error',
                        title: 'Import gagal',
                        message: error.message
                      });
                    });
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>

            {/* Sync buttons */}
            {onlineStatus.isSupabaseAvailable && (
              <>
                {!isOnlineMode && (
                  <button 
                    onClick={async () => {
                      setIsSyncing(true);
                      setSyncStatus('Sinkronisasi...');
                      try {
                        const localProducts = LocalStorageService.loadProducts();
                        for (const product of localProducts) {
                          await db.addProduct(product);
                        }
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
                    }}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                  >
                    <Database size={18} />
                    {isSyncing ? 'Menyinkron...' : 'Sync ke Server'}
                  </button>
                )}
                {isOnlineMode && (
                  <button 
                    onClick={async () => {
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
                    }}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} />
                    {isSyncing ? 'Mengunduh...' : 'Refresh dari Server'}
                  </button>
                )}
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

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
              Tidak ada barang yang ditemukan
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm 
                ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
                : 'Belum ada data produk. Silakan tambah produk baru.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Gambar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Harga Beli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Harga Jual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <ImageIcon size={20} className="text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {product.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.stock <= 5 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          : product.stock <= 20
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(product.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Hapus barang ini?')) {
                              try {
                                if (isOnlineMode && supabase) {
                                  await db.deleteProduct(product.id);
                                }
                                setProducts(prev => prev.filter(p => p.id !== product.id));
                                const updatedProducts = products.filter(p => p.id !== product.id);
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
                          }}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kode Produk
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: PRD001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: Premium Arabica Coffee"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: 899123456001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Beverage">Minuman</option>
                    <option value="Food">Makanan</option>
                    <option value="Snack">Snack</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Harga Beli
                  </label>
                  <input
                    type="text"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Harga Jual
                  </label>
                  <input
                    type="text"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Gambar Produk
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className={`flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <ImageIcon size={18} />
                        {uploadingImage ? 'Mengunggah...' : 'Pilih Gambar'}
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview"
                          className="h-32 w-32 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image_url: '' }));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  {editingProduct ? 'Update Barang' : 'Tambah Barang'}
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
