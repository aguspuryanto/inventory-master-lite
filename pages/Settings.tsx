import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Store, Bell, Moon, Sun, Globe, Database, Shield, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StoreSettings } from '../types';
import { db } from '../services/db';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentStore, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    currency: 'IDR',
    taxRate: 11,
    lowStockThreshold: 10,
    enableNotifications: true,
    enableEmailReports: false,
    reportFrequency: 'weekly'
  });

  useEffect(() => {
    // Check device type
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    // Check dark mode
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                  (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (currentStore) {
      loadStoreSettings();
    }
  }, [currentStore]);

  const loadStoreSettings = async () => {
    if (!currentStore) return;
    
    try {
      const settings = await db.getStoreSettings(currentStore.id);
      if (settings) {
        setStoreSettings(settings);
        setFormData({
          storeName: currentStore.name || '',
          storeDescription: currentStore.description || '',
          storeAddress: currentStore.address || '',
          storePhone: currentStore.phone || '',
          storeEmail: currentStore.email || '',
          currency: settings.currency || 'IDR',
          taxRate: settings.tax_rate || 11,
          lowStockThreshold: settings.low_stock_threshold || 10,
          enableNotifications: settings.enable_notifications !== false,
          enableEmailReports: settings.enable_email_reports || false,
          reportFrequency: settings.report_frequency || 'weekly'
        });
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply dark mode class to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!currentStore) throw new Error('No store selected');

      // Update store settings
      await db.updateStoreSettings({
        currency: formData.currency,
        tax_rate: formData.taxRate,
        low_stock_threshold: formData.lowStockThreshold,
        enable_notifications: formData.enableNotifications,
        enable_email_reports: formData.enableEmailReports,
        report_frequency: formData.reportFrequency,
        updated_at: new Date().toISOString()
      }, currentStore.id);

      setSuccess('Pengaturan berhasil disimpan!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || !currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Silakan login untuk mengakses halaman pengaturan</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Settings className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pengaturan</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola pengaturan toko dan aplikasi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="p-2 text-slate-500 dark:text-slate-400" title={isMobile ? "Tampilan Mobile" : "Tampilan Desktop"}>
                {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl">
            <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Store size={20} className="text-purple-600 dark:text-purple-400" />
              Informasi Toko
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Toko
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Nama Toko"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nama toko tidak dapat diubah dari halaman ini</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Toko
                </label>
                <input
                  type="email"
                  name="storeEmail"
                  value={formData.storeEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="email@toko.com"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email toko tidak dapat diubah dari halaman ini</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Deskripsi Toko
                </label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  placeholder="Deskripsi singkat tentang toko Anda"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deskripsi toko tidak dapat diubah dari halaman ini</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Alamat Toko
                </label>
                <input
                  type="text"
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Jl. Contoh No. 123"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Alamat toko tidak dapat diubah dari halaman ini</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telepon Toko
                </label>
                <input
                  type="tel"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="(021) 12345678"
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Telepon toko tidak dapat diubah dari halaman ini</p>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-purple-600 dark:text-purple-400" />
              Pengaturan Aplikasi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Globe size={16} className="inline mr-1" />
                  Mata Uang
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="SGD">Singapore Dollar (SGD)</option>
                  <option value="MYR">Malaysian Ringgit (MYR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="11"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Persentase pajak untuk transaksi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Database
                </label>
                <input
                  type="text"
                  value="Supabase"
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Database yang digunakan untuk menyimpan data</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Threshold Stok Rendah
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="10"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notifikasi saat stok mencapai jumlah ini</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Bell size={20} className="text-purple-600 dark:text-purple-400" />
              Pengaturan Notifikasi
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Notifikasi Stok Rendah
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dapatkan notifikasi saat stok menipis</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableNotifications"
                    checked={formData.enableNotifications}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Laporan Email
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Kirim laporan rutin via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableEmailReports"
                    checked={formData.enableEmailReports}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {formData.enableEmailReports && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Frekuensi Laporan
                  </label>
                  <select
                    name="reportFrequency"
                    value={formData.reportFrequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all shadow-lg shadow-purple-100 dark:shadow-none"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
            >
              Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
