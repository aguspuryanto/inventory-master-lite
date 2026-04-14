import React, { useState } from 'react';
import { 
  Package, 
  Settings, 
  X, 
  Save,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  BarChart3,
  Tag,
  AlertTriangle
} from 'lucide-react';

interface ProductSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ProductSettings {
  lowStockThreshold: number;
  autoReorder: boolean;
  defaultCategory: string;
  enableBarcode: boolean;
  enableSKU: boolean;
  taxIncluded: boolean;
  discountAllowed: boolean;
}

const ProductSettingsModal: React.FC<ProductSettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  // Product Categories
  const [categories, setCategories] = useState<ProductCategory[]>([
    { id: '1', name: 'Makanan', description: 'Produk makanan dan minuman', color: 'bg-red-100 text-red-600' },
    { id: '2', name: 'Minuman', description: 'Berbagai jenis minuman', color: 'bg-blue-100 text-blue-600' },
    { id: '3', name: 'Snack', description: 'Makanan ringan dan cemilan', color: 'bg-yellow-100 text-yellow-600' },
    { id: '4', name: 'Rokok', description: 'Produk tembakau', color: 'bg-gray-100 text-gray-600' },
    { id: '5', name: 'Lainnya', description: 'Produk lainnya', color: 'bg-purple-100 text-purple-600' }
  ]);

  // Product Settings
  const [settings, setSettings] = useState<ProductSettings>({
    lowStockThreshold: 10,
    autoReorder: true,
    defaultCategory: '1',
    enableBarcode: true,
    enableSKU: true,
    taxIncluded: true,
    discountAllowed: true
  });

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Save to backend
    console.log('Saving product settings:', settings);
    alert('Pengaturan produk berhasil disimpan!');
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      const category: ProductCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        color: categories[categories.length % 5].color // Cycle through colors
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', description: '' });
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Pengaturan Umum</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Stok Minimum</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Notifikasi saat stok mencapai batas minimum</p>
            </div>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({...settings, lowStockThreshold: Number(e.target.value)})}
              className="w-20 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Pesan Ulang Otomatis</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pesan ulang produk saat stok habis</p>
            </div>
            <button
              onClick={() => setSettings({...settings, autoReorder: !settings.autoReorder})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.autoReorder ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.autoReorder ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Barcode</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aktifkan scanning barcode produk</p>
            </div>
            <button
              onClick={() => setSettings({...settings, enableBarcode: !settings.enableBarcode})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.enableBarcode ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.enableBarcode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">SKU</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gunakan SKU untuk produk</p>
            </div>
            <button
              onClick={() => setSettings({...settings, enableSKU: !settings.enableSKU})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.enableSKU ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.enableSKU ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Kategori Produk</h3>
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Kategori
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-4 h-4 rounded-full ${category.color.split(' ')[0]}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">{category.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddCategory && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
            <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-3">Tambah Kategori Baru</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama kategori"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="Deskripsi kategori"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                rows={2}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Pengaturan Lanjutan</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Pajak</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Termasuk pajak dalam harga jual</p>
            </div>
            <button
              onClick={() => setSettings({...settings, taxIncluded: !settings.taxIncluded})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.taxIncluded ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.taxIncluded ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Diskon</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Izinkan diskon pada produk</p>
            </div>
            <button
              onClick={() => setSettings({...settings, discountAllowed: !settings.discountAllowed})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.discountAllowed ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.discountAllowed ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'categories', label: 'Kategori', icon: Tag },
    { id: 'advanced', label: 'Lanjutan', icon: BarChart3 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Manajemen Produk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pengaturan dan kategori produk</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-purple-600'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'advanced' && renderAdvanced()}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleSaveSettings}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Simpan Pengaturan Produk
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSettingsModal;
