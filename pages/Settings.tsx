import React, { useState } from 'react';
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
  X
} from 'lucide-react';

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  tax: number;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'ewallet' | 'bank_transfer';
  isActive: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Toko KasirKu',
    address: 'Jl. Contoh No. 123, Jakarta',
    phone: '021-12345678',
    email: 'info@kasirku.com',
    tax: 11
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin Utama',
    email: 'admin@kasirku.com',
    role: 'Super Admin',
    avatar: ''
  });

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@kasirku.com',
      role: 'Kasir',
      phone: '0812-3456-7890',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@kasirku.com',
      role: 'Admin',
      phone: '0813-4567-8901',
      status: 'active'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Tunai', type: 'cash', isActive: true },
    { id: '2', name: 'Kartu Debit', type: 'card', isActive: true },
    { id: '3', name: 'Kartu Kredit', type: 'card', isActive: true },
    { id: '4', name: 'GoPay', type: 'ewallet', isActive: false },
    { id: '5', name: 'OVO', type: 'ewallet', isActive: false },
    { id: '6', name: 'Transfer Bank', type: 'bank_transfer', isActive: true }
  ]);

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({});
  const [newPayment, setNewPayment] = useState<Partial<PaymentMethod>>({});

  const tabs = [
    { id: 'store', label: 'Pengaturan Toko', icon: Store },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'sync', label: 'Sinkronisasi', icon: RefreshCw },
    { id: 'printer', label: 'Printer & Struk', icon: Printer },
    { id: 'staff', label: 'Kelola Staff', icon: Users },
    { id: 'payment', label: 'Metode Pembayaran', icon: CreditCard }
  ];

  const handleSaveStoreSettings = () => {
    // Simpan pengaturan toko
    console.log('Saving store settings:', storeSettings);
    alert('Pengaturan toko berhasil disimpan!');
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
              value={storeSettings.tax}
              onChange={(e) => setStoreSettings({...storeSettings, tax: Number(e.target.value)})}
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
              Printer Default
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100">
              <option>EPON TM-U220</option>
              <option>Canon PIXMA</option>
              <option>HP LaserJet</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kertas Struk
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100">
                <option>58mm</option>
                <option>80mm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Orientasi
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100">
                <option>Portrait</option>
                <option>Landscape</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autoPrint" className="rounded" />
            <label htmlFor="autoPrint" className="text-sm text-slate-700 dark:text-slate-300">
              Cetak struk otomatis setelah transaksi
            </label>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Test Print
          </button>
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Pengaturan</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
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
