
import React, { useState } from 'react';
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
  // Added Package and X icons
  Package,
  X
} from 'lucide-react';
import { Product, Transaction } from '../types';
import { formatCurrency, parseFormattedNumber, generateId } from '../utils';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onStockEntry: (tx: Transaction) => void;
}

const Products: React.FC<ProductsProps> = ({ products, setProducts, onStockEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : generateId(),
      code: formData.code,
      name: formData.name,
      barcode: formData.barcode,
      purchasePrice: parseFormattedNumber(formData.purchasePrice),
      sellingPrice: parseFormattedNumber(formData.sellingPrice),
      stock: parseInt(formData.stock),
      category: formData.category
    };

    if (editingProduct) {
      // If stock increased manually, track as IN transaction
      if (productData.stock > editingProduct.stock) {
        const diff = productData.stock - editingProduct.stock;
        onStockEntry({
          id: generateId(),
          date: new Date().toISOString(),
          type: 'IN',
          total: productData.purchasePrice * diff,
          items: [{
            productId: productData.id,
            name: productData.name,
            price: productData.purchasePrice,
            quantity: diff,
            subtotal: productData.purchasePrice * diff
          }]
        });
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts(prev => [...prev, productData]);
      if (productData.stock > 0) {
        onStockEntry({
          id: generateId(),
          date: new Date().toISOString(),
          type: 'IN',
          total: productData.purchasePrice * productData.stock,
          items: [{
            productId: productData.id,
            name: productData.name,
            price: productData.purchasePrice,
            quantity: productData.stock,
            subtotal: productData.purchasePrice * productData.stock
          }]
        });
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus barang ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Barang</h1>
          <p className="text-slate-500">Kelola master data produk dan stok inventaris</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={18} />
            Export
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
          >
            <Plus size={18} />
            Tambah Barang
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, kode, atau barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
              <Filter size={18} />
            </button>
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold uppercase">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{p.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{p.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Barcode size={14} />
                      <span className="text-sm font-mono">{p.barcode || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">Rp {formatCurrency(p.sellingPrice)}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Profit: Rp {formatCurrency(p.sellingPrice - p.purchasePrice)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.stock <= 5 ? 'bg-rose-50 text-rose-600' : 
                      p.stock <= 15 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {p.category}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                      <Package className="text-slate-200" size={64} />
                      <p className="text-slate-400 font-medium">Tidak ada barang yang ditemukan.</p>
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
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kode Barang</label>
                  <input 
                    required 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Barcode</label>
                  <input 
                    value={formData.barcode} 
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                    placeholder="Scan atau ketik barcode..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Barang</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga Beli</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                    <input 
                      required 
                      value={formData.purchasePrice} 
                      onChange={e => setFormData({...formData, purchasePrice: formatCurrency(parseFormattedNumber(e.target.value))})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                    <input 
                      required 
                      value={formData.sellingPrice} 
                      onChange={e => setFormData({...formData, sellingPrice: formatCurrency(parseFormattedNumber(e.target.value))})}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stok</label>
                  <input 
                    type="number"
                    required 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
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
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
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
