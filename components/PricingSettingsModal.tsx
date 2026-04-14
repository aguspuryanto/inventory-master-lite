import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  Tag, 
  TrendingUp, 
  Calculator, 
  Save,
  X,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface PricingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  category: string;
  minQuantity: number;
  isActive: boolean;
}

interface PricingSettings {
  defaultMargin: number;
  enableDiscount: boolean;
  maxDiscount: number;
  taxRate: number;
  roundingRule: 'up' | 'down' | 'nearest';
  enableBulkPricing: boolean;
}

const PricingSettingsModal: React.FC<PricingSettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('rules');
  
  // Pricing Rules
  const [rules, setRules] = useState<PricingRule[]>([
    { id: '1', name: 'Margin Standar', type: 'percentage', value: 25, category: 'all', minQuantity: 1, isActive: true },
    { id: '2', name: 'Diskon Member', type: 'percentage', value: 10, category: 'customers', minQuantity: 2, isActive: true },
    { id: '3', name: 'Harga Grosir', type: 'percentage', value: 15, category: 'bulk', minQuantity: 5, isActive: false }
  ]);

  // Pricing Settings
  const [settings, setSettings] = useState<PricingSettings>({
    defaultMargin: 25,
    enableDiscount: true,
    maxDiscount: 50,
    taxRate: 11,
    roundingRule: 'nearest',
    enableBulkPricing: false
  });

  const [newRule, setNewRule] = useState({ name: '', type: 'percentage' as const, value: 0, category: 'all', minQuantity: 1 });
  const [showAddRule, setShowAddRule] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Save to backend
    console.log('Saving pricing settings:', settings);
    alert('Pengaturan harga berhasil disimpan!');
    onClose();
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.value > 0) {
      const rule: PricingRule = {
        id: Date.now().toString(),
        name: newRule.name,
        type: newRule.type,
        value: newRule.value,
        category: newRule.category,
        minQuantity: newRule.minQuantity,
        isActive: true
      };
      setRules([...rules, rule]);
      setNewRule({ name: '', type: 'percentage', value: 0, category: 'all', minQuantity: 1 });
      setShowAddRule(false);
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const renderRules = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Aturan Harga</h3>
          <button
            onClick={() => setShowAddRule(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Aturan
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Tag className="text-emerald-600 dark:text-emerald-400" size={12} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">{rule.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{rule.type === 'percentage' ? `${rule.value}%` : `Rp ${rule.value.toLocaleString('id-ID')}`}</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      {rule.category === 'all' ? 'Semua' : rule.category === 'customers' ? 'Pelanggan' : 'Grosir'}
                    </span>
                    <span>Min. {rule.minQuantity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleToggleRule(rule.id)}
                  className={`p-2 ${rule.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} transition-colors`}
                >
                  <div className={`w-6 h-6 rounded-full ${rule.isActive ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700'}`} />
                </button>
                <button 
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddRule && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-3">Tambah Aturan Harga Baru</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama aturan"
                value={newRule.name}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({...newRule, type: e.target.value as 'percentage' | 'fixed'})}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="percentage">Persentase</option>
                  <option value="fixed">Tetap (Rp)</option>
                </select>
                <input
                  type="number"
                  placeholder="Nilai"
                  value={newRule.value || ''}
                  onChange={(e) => setNewRule({...newRule, value: Number(e.target.value)})}
                  className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={newRule.category}
                onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Produk</option>
                <option value="customers">Pelanggan Member</option>
                <option value="bulk">Pembelian Grosir</option>
              </select>
              <input
                type="number"
                placeholder="Qty minimum"
                value={newRule.minQuantity || ''}
                onChange={(e) => setNewRule({...newRule, minQuantity: Number(e.target.value)})}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowAddRule(false)}
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

  const renderGeneral = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Pengaturan Harga Umum</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Margin Default</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Margin keuntungan standar</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.defaultMargin}
                onChange={(e) => setSettings({...settings, defaultMargin: Number(e.target.value)})}
                className="w-20 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Diskon Maksimal</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Batas diskon tertinggi</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.maxDiscount}
                onChange={(e) => setSettings({...settings, maxDiscount: Number(e.target.value)})}
                className="w-20 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Pajak</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pajak penjualan</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                className="w-20 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>
        </div>
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
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Pembulatan Harga</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aturan pembulatan</p>
            </div>
            <select
              value={settings.roundingRule}
              onChange={(e) => setSettings({...settings, roundingRule: e.target.value as 'up' | 'down' | 'nearest'})}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="up">Bulat ke Atas</option>
              <option value="down">Bulat ke Bawah</option>
              <option value="nearest">Bulat ke Terdekat</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">Harga Grosir</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Aktifkan harga grosir</p>
            </div>
            <button
              onClick={() => setSettings({...settings, enableBulkPricing: !settings.enableBulkPricing})}
              className={`w-12 h-6 rounded-full transition-colors ${settings.enableBulkPricing ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.enableBulkPricing ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'rules', label: 'Aturan', icon: Tag },
    { id: 'general', label: 'Umum', icon: Calculator },
    { id: 'advanced', label: 'Lanjutan', icon: TrendingUp }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Harga & Diskon</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aturan harga dan diskon produk</p>
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
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600'
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
          {activeTab === 'rules' && renderRules()}
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'advanced' && renderAdvanced()}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleSaveSettings}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Simpan Pengaturan Harga
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingSettingsModal;
