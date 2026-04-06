import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  DollarSign, 
  Bell, 
  Printer, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  ChevronRight,
  X,
  Save,
  Smartphone
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface MobileSettingsProps {
  session: Session | null;
  handleLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const MobileSettings: React.FC<MobileSettingsProps> = ({ 
  session, 
  handleLogout, 
  isDarkMode, 
  setIsDarkMode 
}) => {
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Store settings state
  const [storeName, setStoreName] = useState('InvMaster POS');
  const [storeAddress, setStoreAddress] = useState('Gedung Sudirman Lantai 4, Jakarta');
  const [storePhone, setStorePhone] = useState('(021) 12345678');
  const [storeEmail, setStoreEmail] = useState('info@invmaster.com');
  
  // Notification settings state
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [salesNotification, setSalesNotification] = useState(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);

  const handleSaveStoreSettings = () => {
    // TODO: Save to localStorage or backend
    alert('Pengaturan toko berhasil disimpan!');
    setIsStoreSettingsOpen(false);
  };

  const handleSaveNotificationSettings = () => {
    // TODO: Save to localStorage or backend
    alert('Pengaturan notifikasi berhasil disimpan!');
    setIsNotificationOpen(false);
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Store Info Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Store size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{storeName}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {session?.user?.email || 'admin@invmaster.com'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-2xl text-center">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Mode</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
              <Smartphone size={14} />
              Mobile
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-center">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Status</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Online</p>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        {/* Store Settings */}
        <button 
          onClick={() => setIsStoreSettingsOpen(true)}
          className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Store className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Pengaturan Toko</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Product Settings */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Manajemen Produk</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Pricing */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Harga & Diskon</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Notifications */}
        <button 
          onClick={() => setIsNotificationOpen(true)}
          className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Bell className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Notifikasi</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Printer */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center">
              <Printer className="text-rose-600 dark:text-rose-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Printer & Struk</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Security */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Shield className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Keamanan</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Appearance */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-50 dark:bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Palette className="text-pink-600 dark:text-pink-400" size={20} />
            </div>
            <div className="flex-1 text-left">
              <span className="font-bold text-slate-700 dark:text-slate-200">Tampilan</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isDarkMode ? 'Mode Gelap' : 'Mode Terang'}
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDarkMode(!isDarkMode);
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </button>

        {/* Language */}
        <button className="w-full p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <Globe className="text-cyan-600 dark:text-cyan-400" size={20} />
            </div>
            <div className="flex-1 text-left">
              <span className="font-bold text-slate-700 dark:text-slate-200">Bahasa</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Indonesia</p>
            </div>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Help */}
        <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center">
              <HelpCircle className="text-slate-600 dark:text-slate-300" size={20} />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">Bantuan & Dukungan</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>
      </div>

      {/* Store Settings Modal */}
      {isStoreSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsStoreSettingsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Pengaturan Toko</h3>
              <button onClick={() => setIsStoreSettingsOpen(false)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Toko</label>
                <input 
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Alamat</label>
                <textarea 
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Telepon</label>
                <input 
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email</label>
                <input 
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button onClick={handleSaveStoreSettings} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Save size={20} />
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNotificationOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Pengaturan Notifikasi</h3>
              <button onClick={() => setIsNotificationOpen(false)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Stok Minimum</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notifikasi saat stok hampir habis</p>
                </div>
                <button 
                  onClick={() => setLowStockAlert(!lowStockAlert)}
                  className={`w-12 h-6 rounded-full transition-colors ${lowStockAlert ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${lowStockAlert ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifikasi Penjualan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Alert setiap transaksi berhasil</p>
                </div>
                <button 
                  onClick={() => setSalesNotification(!salesNotification)}
                  className={`w-12 h-6 rounded-full transition-colors ${salesNotification ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${salesNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Auto Print Struk</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cetak struk otomatis setelah pembayaran</p>
                </div>
                <button 
                  onClick={() => setAutoPrintReceipt(!autoPrintReceipt)}
                  className={`w-12 h-6 rounded-full transition-colors ${autoPrintReceipt ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoPrintReceipt ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button onClick={handleSaveNotificationSettings} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Save size={20} />
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSettings;
