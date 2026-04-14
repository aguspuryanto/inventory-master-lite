import React, { useState } from 'react';
import { 
  Printer, 
  Settings, 
  FileText, 
  Wifi, 
  WifiOff, 
  Save,
  X,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface PrinterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrinterProfile {
  id: string;
  name: string;
  type: 'thermal' | 'inkjet' | 'laser';
  connection: 'usb' | 'bluetooth' | 'wifi' | 'network';
  paperSize: '58mm' | '80mm' | 'a4';
  isDefault: boolean;
  isOnline: boolean;
  ipAddress?: string;
  port?: string;
}

interface ReceiptSettings {
  logo: boolean;
  header: boolean;
  footer: boolean;
  qrCode: boolean;
  barcode: boolean;
  customerInfo: boolean;
  paymentMethod: boolean;
  taxInfo: boolean;
  duplicate: boolean;
}

const PrinterSettingsModal: React.FC<PrinterSettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('printers');
  
  // Printer Profiles
  const [printers, setPrinters] = useState<PrinterProfile[]>([
    { 
      id: '1', 
      name: 'EPON TM-U220', 
      type: 'thermal', 
      connection: 'usb', 
      paperSize: '80mm', 
      isDefault: true, 
      isOnline: true 
    },
    { 
      id: '2', 
      name: 'Bluetooth Printer', 
      type: 'thermal', 
      connection: 'bluetooth', 
      paperSize: '58mm', 
      isDefault: false, 
      isOnline: false 
    }
  ]);

  // Receipt Settings
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    logo: true,
    header: true,
    footer: true,
    qrCode: true,
    barcode: true,
    customerInfo: true,
    paymentMethod: true,
    taxInfo: true,
    duplicate: false
  });

  const [newPrinter, setNewPrinter] = useState({ name: '', type: 'thermal' as const, connection: 'usb' as const, paperSize: '80mm' as const });
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Save to backend
    console.log('Saving printer settings:', { printers, receiptSettings });
    alert('Pengaturan printer berhasil disimpan!');
    onClose();
  };

  const handleAddPrinter = () => {
    if (newPrinter.name) {
      const printer: PrinterProfile = {
        id: Date.now().toString(),
        name: newPrinter.name,
        type: newPrinter.type,
        connection: newPrinter.connection,
        paperSize: newPrinter.paperSize,
        isDefault: false,
        isOnline: false
      };
      setPrinters([...printers, printer]);
      setNewPrinter({ name: '', type: 'thermal', connection: 'usb', paperSize: '80mm' });
      setShowAddPrinter(false);
    }
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters(printers.filter(printer => printer.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPrinters(printers.map(printer => 
      ({ ...printer, isDefault: printer.id === id })
    ));
  };

  const handleSearchPrinters = async () => {
    setIsSearching(true);
    // Simulate printer search
    setTimeout(() => {
      setIsSearching(false);
      alert('Pencarian printer selesai. Tidak ada printer baru ditemukan.');
    }, 2000);
  };

  const renderPrinters = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daftar Printer</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSearchPrinters}
              disabled={isSearching}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Wifi size={16} />
              {isSearching ? 'Mencari...' : 'Cari Printer'}
            </button>
            <button
              onClick={() => setShowAddPrinter(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Tambah Printer
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {printers.map((printer) => (
            <div key={printer.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-4 h-4 rounded-full ${printer.isOnline ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-200 dark:bg-slate-600'} flex items-center justify-center`}>
                  {printer.isOnline ? (
                    <Wifi className="text-emerald-600 dark:text-emerald-400" size={12} />
                  ) : (
                    <WifiOff className="text-slate-400 dark:text-slate-500" size={12} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-100">{printer.name}</h4>
                    {printer.isDefault && (
                      <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{printer.type === 'thermal' ? 'Thermal' : printer.type === 'inkjet' ? 'Inkjet' : 'Laser'}</span>
                    <span>·</span>
                    <span>{printer.connection === 'usb' ? 'USB' : printer.connection === 'bluetooth' ? 'Bluetooth' : printer.connection === 'wifi' ? 'WiFi' : 'Network'}</span>
                    <span>·</span>
                    <span>{printer.paperSize}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Edit size={16} />
                </button>
                {!printer.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(printer.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleDeletePrinter(printer.id)}
                  className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddPrinter && (
          <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
            <h4 className="font-medium text-rose-600 dark:text-rose-400 mb-3">Tambah Printer Baru</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama printer"
                value={newPrinter.name}
                onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newPrinter.type}
                  onChange={(e) => setNewPrinter({...newPrinter, type: e.target.value as 'thermal' | 'inkjet' | 'laser'})}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="thermal">Thermal</option>
                  <option value="inkjet">Inkjet</option>
                  <option value="laser">Laser</option>
                </select>
                <select
                  value={newPrinter.connection}
                  onChange={(e) => setNewPrinter({...newPrinter, connection: e.target.value as 'usb' | 'bluetooth' | 'wifi' | 'network'})}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="usb">USB</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="wifi">WiFi</option>
                  <option value="network">Network</option>
                </select>
              </div>
              <select
                value={newPrinter.paperSize}
                onChange={(e) => setNewPrinter({...newPrinter, paperSize: e.target.value as '58mm' | '80mm' | 'a4'})}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
                <option value="a4">A4</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPrinter}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowAddPrinter(false)}
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

  const renderReceipt = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Pengaturan Struk</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Logo Toko</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tampilkan logo di struk</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, logo: !receiptSettings.logo})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.logo ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.logo ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Header</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Info toko di bagian atas</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, header: !receiptSettings.header})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.header ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.header ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Footer</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Info pembayaran di bagian bawah</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, footer: !receiptSettings.footer})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.footer ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.footer ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">QR Code</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">QR code untuk pembayaran digital</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, qrCode: !receiptSettings.qrCode})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.qrCode ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.qrCode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Barcode</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Barcode produk di struk</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, barcode: !receiptSettings.barcode})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.barcode ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.barcode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Info Pelanggan</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nama dan kontak pelanggan</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, customerInfo: !receiptSettings.customerInfo})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.customerInfo ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.customerInfo ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Metode Pembayaran</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tampilkan metode pembayaran</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, paymentMethod: !receiptSettings.paymentMethod})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.paymentMethod ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.paymentMethod ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Info Pajak</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Detail pajak dan PPN</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, taxInfo: !receiptSettings.taxInfo})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.taxInfo ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.taxInfo ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Cetak Duplikat</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cetak 2 lembar struk</p>
            </div>
            <button
              onClick={() => setReceiptSettings({...receiptSettings, duplicate: !receiptSettings.duplicate})}
              className={`w-12 h-6 rounded-full transition-colors ${receiptSettings.duplicate ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${receiptSettings.duplicate ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Uji Coba Printer</h3>
        
        <div className="space-y-4">
          <button className="w-full p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-between hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center">
                <FileText className="text-rose-600 dark:text-rose-400" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-slate-800 dark:text-slate-100">Cetak Struk Uji</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Cetak struk contoh untuk testing</p>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </button>

          <button className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-slate-600 dark:text-slate-300" size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-slate-800 dark:text-slate-100">Diagnostik Printer</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Periksa status dan koneksi printer</p>
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'printers', label: 'Printer', icon: Printer },
    { id: 'receipt', label: 'Struk', icon: FileText },
    { id: 'test', label: 'Uji Coba', icon: Settings }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center">
              <Printer className="text-rose-600 dark:text-rose-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Printer & Struk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pengaturan printer dan struk</p>
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
                  ? 'text-rose-600 dark:text-rose-400 border-rose-600'
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
          {activeTab === 'printers' && renderPrinters()}
          {activeTab === 'receipt' && renderReceipt()}
          {activeTab === 'test' && renderTest()}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleSaveSettings}
            className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-rose-700 shadow-xl shadow-rose-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Simpan Pengaturan Printer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettingsModal;
