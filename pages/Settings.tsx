import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  User, 
  RefreshCw, 
  Printer, 
  Users, 
  CreditCard,
  ChevronRight,
  Save,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Crown
} from 'lucide-react';
import { PrinterSettings, StoreSettings, UserProfile, Staff, PaymentMethod } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, currentStore } = useAuth();
  
  // Helper function to get correct storeId for database operations
  const getStoreId = () => {
    return user?.email === 'admin@example.com' ? null : currentStore?.id;
  };
  console.log('user', user);
  console.log('currentStore', currentStore);
  const [activeTab, setActiveTab] = useState('store');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    // Initialize with currentStore data if available, otherwise use defaults
    if (currentStore) {
      return {
        id: '',
        store_id: getStoreId(),
        name: currentStore.name,
        address: currentStore.address || '',
        phone: currentStore.phone || '',
        email: currentStore.email || '',
        currency: 'IDR',
        tax_rate: 11,
        low_stock_threshold: 10,
        enable_notifications: true,
        enable_email_reports: false,
        report_frequency: 'monthly',
        created_at: currentStore.created_at,
        updated_at: currentStore.updated_at
      };
    }
    
    // Default values if no currentStore
    return {
      id: '',
      store_id: '',
      name: 'Toko KasirKu',
      address: 'Jl. Contoh No. 123, Jakarta',
      phone: '021-12345678',
      email: 'info@kasirku.com',
      currency: 'IDR',
      tax_rate: 11,
      low_stock_threshold: 10,
      enable_notifications: true,
      enable_email_reports: false,
      report_frequency: 'monthly',
      created_at: '',
      updated_at: ''
    };
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // Initialize with user data if available, otherwise use defaults
    if (user) {
      return {
        name: user.full_name || 'Admin Utama',
        email: user.email || 'admin@kasirku.com',
        role: user.is_owner ? 'Owner' : user.is_subscribe ? 'Premium User' : 'User',
        avatar: ''
      };
    }
    
    // Default values if no user
    return {
      name: 'Admin Utama',
      email: 'admin@kasirku.com',
      role: 'Super Admin',
      avatar: ''
    };
  });

  const [staff, setStaff] = useState<Staff[]>([]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod>(() => {
  // Different payment methods based on user type
  if (user?.is_owner || user?.is_subscribe) {
    // Premium users get all payment methods
    return [
      { id: '1', name: 'Tunai', type: 'cash', isActive: true },
      { id: '2', name: 'Kartu Debit', type: 'card', isActive: true },
      { id: '3', name: 'Kartu Kredit', type: 'card', isActive: true },
      { id: '4', name: 'GoPay', type: 'ewallet', isActive: false },
      { id: '5', name: 'OVO', type: 'ewallet', isActive: false },
      { id: '6', name: 'Transfer Bank', type: 'bank_transfer', isActive: true }
    ];
  } else {
    // Regular users only get cash and bank transfer
    return [
      { id: '1', name: 'Tunai', type: 'cash', isActive: true },
      { id: '2', name: 'Transfer Bank', type: 'bank_transfer', isActive: true }
    ];
  }
});

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    paperSize: '58mm',
    orientation: 'Portrait',
    autoPrint: false
  });

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({});
  const [newPayment, setNewPayment] = useState<Partial<PaymentMethod>>({});
  const [isScanning, setIsScanning] = useState(false);

  const tabs = [
    { id: 'store', label: 'Pengaturan Toko', icon: Store },
    { id: 'profile', label: 'Profil', icon: User },
    ...(user?.is_owner || user?.is_subscribe ? [{ id: 'sync', label: 'Sinkronisasi', icon: RefreshCw }] : []),
    { id: 'printer', label: 'Printer & Struk', icon: Printer },
    { id: 'staff', label: 'Kelola Staff', icon: Users },
    { id: 'payment', label: 'Metode Pembayaran', icon: CreditCard }
  ];

  
  // Load printer settings from database
  useEffect(() => {
    const loadPrinterSettings = async () => {
      try {
        const settings = await db.getPrinterSettings();
        if (settings) {
          setPrinterSettings(settings);
          localStorage.setItem('printerSettings', JSON.stringify(settings));
        } else {
          // Fallback to localStorage if no database settings
          const savedPrinterSettings = localStorage.getItem('printerSettings');
          if (savedPrinterSettings) {
            const parsed = JSON.parse(savedPrinterSettings);
            setPrinterSettings(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading printer settings:', error);
        // Fallback to localStorage on error
        const savedPrinterSettings = localStorage.getItem('printerSettings');
        if (savedPrinterSettings) {
          try {
            const parsed = JSON.parse(savedPrinterSettings);
            setPrinterSettings(parsed);
          } catch (parseError) {
            console.error('Error parsing saved printer settings:', parseError);
          }
        }
      }
    };
    
    loadPrinterSettings();
  }, [currentStore]);

  const handleSaveStoreSettings = async () => {
    if (!currentStore) {
      alert('Tidak ada toko yang dipilih!');
      return;
    }

    try {
      await db.updateStoreSettings(storeSettings, getStoreId());
      alert('Pengaturan toko berhasil disimpan!');
    } catch (error) {
      console.error('Error saving store settings:', error);
      alert('Gagal menyimpan pengaturan toko');
    }
  };

  const handleSaveProfile = () => {
    // Simpan profil
    console.log('Saving profile:', userProfile);
    alert('Profil berhasil diperbarui!');
  };

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.role) {
      const staffToAdd: Staff = {
        id: Date.now().toString(),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        phone: newStaff.phone || '',
        status: 'active'
      };
      setStaff([...staff, staffToAdd]);
      setNewStaff({});
      setShowAddStaff(false);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleToggleStaffStatus = (id: string) => {
    setStaff(staff.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
  };

  const handleAddPayment = () => {
    if (newPayment.name && newPayment.type) {
      const paymentToAdd: PaymentMethod = {
        id: Date.now().toString(),
        name: newPayment.name,
        type: newPayment.type as PaymentMethod['type'],
        isActive: true
      };
      setPaymentMethods([...paymentMethods, paymentToAdd]);
      setNewPayment({});
      setShowAddPayment(false);
    }
  };

  const handleTogglePayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  const handleScanBluetooth = async () => {
    if (!navigator.bluetooth) {
      alert('Bluetooth tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera.');
      return;
    }

    setIsScanning(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000180a-0000-1000-8000-00805f9b34fb',
          '00001812-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          'generic_access',
          'device_information'
        ]
      });

      // Save printer settings
      const updatedSettings = {
        ...printerSettings,
        deviceId: device.id,
        deviceName: device.name || 'Unknown Device'
      };
      setPrinterSettings(updatedSettings);
      
      // Save to localStorage
      localStorage.setItem('printerSettings', JSON.stringify(updatedSettings));
      
      alert(`Printer "${device.name}" berhasil disimpan!`);
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      if (error.name === 'NotFoundError') {
        alert('Tidak ada perangkat Bluetooth yang dipilih.');
      } else {
        alert('Gagal memindai perangkat Bluetooth: ' + error.message);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    if (!printerSettings.deviceId) {
      alert('Silakan pilih printer terlebih dahulu.');
      return;
    }

    try {
      // Create test transaction
      const testTransaction = {
        id: 'TEST-' + Date.now(),
        type: 'OUT' as const,
        mainCategory: 'TEST',
        subCategory: 'Test Print',
        amount: 10000,
        createdAt: new Date().toISOString(),
        description: 'Test Cetak Printer'
      };

      // Import and use the receipt printer
      const TransactionReceiptPrinterModule = await import('../components/TransactionReceiptPrinter');
      const { printReceipt } = TransactionReceiptPrinterModule.TransactionReceiptPrinter({ transaction: testTransaction });
      await printReceipt();
    } catch (error) {
      console.error('Test print error:', error);
      alert('Gagal mencetak: ' + error.message);
    }
  };

  const handleSavePrinterSettings = async () => {
    // localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
    console.log('Printer settings saved:', printerSettings);
    try {
      await db.setPrinterSettings(printerSettings);
      alert('Pengaturan printer berhasil disimpan!');
    } catch (error) {
      console.error('Error saving printer settings:', error);
      alert('Gagal menyimpan pengaturan printer');
    }
  };

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Informasi Toko</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Toko
            </label>
            <input
              type="text"
              value={storeSettings.name}
              onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={storeSettings.email}
              onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Telepon
            </label>
            <input
              type="tel"
              value={storeSettings.phone}
              onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pajak (%)
            </label>
            <input
              type="number"
              value={storeSettings.tax_rate}
              onChange={(e) => setStoreSettings({...storeSettings, tax_rate: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Alamat
          </label>
          <textarea
            value={storeSettings.address}
            onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <button
          onClick={handleSaveStoreSettings}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Profil Pengguna</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <User size={40} className="text-purple-600 dark:text-purple-400" />
          </div>
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Ganti Foto
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <input
              type="text"
              value={userProfile.role}
              disabled
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Simpan Profil
        </button>
      </div>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Sinkronisasi Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Sinkronisasi Otomatis</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sinkronkan data secara otomatis setiap 5 menit</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Aktifkan
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Backup Data</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Backup semua data ke cloud storage</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <RefreshCw size={16} />
              Backup Sekarang
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Restore Data</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Kembalikan data dari backup</p>
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrinter = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Pengaturan Printer</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Printer Bluetooth
            </label>
            <div className="flex gap-2">
              <select 
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                value={printerSettings.deviceId || ''}
                onChange={(e) => setPrinterSettings({...printerSettings, deviceId: e.target.value, deviceName: e.target.options[e.target.selectedIndex].text})}
              >
                <option value="">Pilih Printer...</option>
                {printerSettings.deviceName && (
                  <option value={printerSettings.deviceId}>{printerSettings.deviceName}</option>
                )}
              </select>
              <button
                onClick={handleScanBluetooth}
                disabled={isScanning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Scan
                  </>
                )}
              </button>
            </div>
            {printerSettings.deviceName && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Terhubung: {printerSettings.deviceName}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kertas Struk
              </label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                value={printerSettings.paperSize}
                onChange={(e) => setPrinterSettings({...printerSettings, paperSize: e.target.value as '58mm' | '80mm'})}
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Orientasi
              </label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                value={printerSettings.orientation}
                onChange={(e) => setPrinterSettings({...printerSettings, orientation: e.target.value as 'Portrait' | 'Landscape'})}
              >
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="autoPrint" 
              className="rounded"
              checked={printerSettings.autoPrint}
              onChange={(e) => setPrinterSettings({...printerSettings, autoPrint: e.target.checked})}
            />
            <label htmlFor="autoPrint" className="text-sm text-slate-700 dark:text-slate-300">
              Cetak struk otomatis setelah transaksi
            </label>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleTestPrint}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Print
            </button>
            <button 
              onClick={handleSavePrinterSettings}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={16} className="inline mr-1" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daftar Staff</h3>
          <button
            onClick={() => setShowAddStaff(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Staff
          </button>
        </div>
        
        {showAddStaff && (
          <div className="mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
            <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-100">Tambah Staff Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama"
                value={newStaff.name || ''}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              />
              <input
                type="email"
                placeholder="Email"
                value={newStaff.email || ''}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              />
              <input
                type="tel"
                placeholder="Telepon"
                value={newStaff.phone || ''}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              />
              <select
                value={newStaff.role || ''}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Pilih Role</option>
                <option value="Admin">Admin</option>
                <option value="Kasir">Kasir</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddStaff}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Check size={16} />
                Simpan
              </button>
              <button
                onClick={() => setShowAddStaff(false)}
                className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <X size={16} />
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Telepon</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 px-4 text-sm text-slate-800 dark:text-slate-100">{member.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{member.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{member.role}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{member.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStaffStatus(member.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Metode Pembayaran</h3>
          <button
            onClick={() => setShowAddPayment(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Metode
          </button>
        </div>

        {showAddPayment && (
          <div className="mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
            <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-100">Tambah Metode Pembayaran</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama Metode"
                value={newPayment.name || ''}
                onChange={(e) => setNewPayment({...newPayment, name: e.target.value})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              />
              <select
                value={newPayment.type || ''}
                onChange={(e) => setNewPayment({...newPayment, type: e.target.value as PaymentMethod['type']})}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Pilih Tipe</option>
                <option value="cash">Tunai</option>
                <option value="card">Kartu</option>
                <option value="ewallet">E-Wallet</option>
                <option value="bank_transfer">Transfer Bank</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddPayment}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Check size={16} />
                Simpan
              </button>
              <button
                onClick={() => setShowAddPayment(false)}
                className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <X size={16} />
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  method.type === 'cash' ? 'bg-green-100 dark:bg-green-900' :
                  method.type === 'card' ? 'bg-blue-100 dark:bg-blue-900' :
                  method.type === 'ewallet' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-orange-100 dark:bg-orange-900'
                }`}>
                  <CreditCard size={20} className={
                    method.type === 'cash' ? 'text-green-600 dark:text-green-400' :
                    method.type === 'card' ? 'text-blue-600 dark:text-blue-400' :
                    method.type === 'ewallet' ? 'text-purple-600 dark:text-purple-400' :
                    'text-orange-600 dark:text-orange-400'
                  } />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">{method.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{method.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTogglePayment(method.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    method.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {method.isActive ? 'Aktif' : 'Nonaktif'}
                </button>
                <button
                  onClick={() => handleDeletePayment(method.id)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-2">
      {/* tambahkan notice untuk user yang belum subscribe */}
      {user && !user.is_subscribe && (
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Anda belum berlangganan</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Untuk mengakses semua fitur, silakan berlangganan premium.
                </p>
              </div>
            </div>
            <Link 
              to="/subscribe"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Crown size={16} />
              Berlangganan
            </Link>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Pengaturan</h1>
      
      <div className="space-y-6">
        {/* Horizontal Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
          <nav className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'store' && renderStoreSettings()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'sync' && renderSync()}
          {activeTab === 'printer' && renderPrinter()}
          {activeTab === 'staff' && renderStaff()}
          {activeTab === 'payment' && renderPayment()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
