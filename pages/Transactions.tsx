import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Eye,
  FileDown,
  History,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { TransactionPDFExport } from '../components/TransactionPDFExport';
import { TransactionReceiptPrinter } from '../components/TransactionReceiptPrinter';
import jsPDF from 'jspdf';

interface TransactionsProps {
  transactions: Transaction[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const { exportToPDF } = TransactionPDFExport({ transactions, filtered });

  const toggleExpand = (id: string) => {
    setExpandedTxId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Riwayat Transaksi</h1>
          <p className="text-slate-500 dark:text-slate-400">Lacak aktivitas barang masuk dan keluar</p>
        </div>
        <button 
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <FileDown size={18} />
          Export ke PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{transactions.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Pembelian</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Rp {formatCurrency(transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0))}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Penjualan</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Rp {formatCurrency(transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID transaksi atau nama barang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['ALL', 'IN', 'OUT'] as const).map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {type === 'ALL' ? 'Semua' : type === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal & ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rincian Barang</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(t => (
                <React.Fragment key={t.id}>
                  <tr 
                    onClick={() => toggleExpand(t.id)}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer ${expandedTxId === t.id ? 'bg-slate-50/80 dark:bg-slate-700/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(t.createdAt)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">#{t.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        t.type === 'IN' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {t.type === 'IN' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                        {t.type === 'IN' ? 'Pembelian' : 'Penjualan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {t.description || '-'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t.subCategory}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Rp {formatCurrency(t.amount)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all">
                        {expandedTxId === t.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>
                  {expandedTxId === t.id && (
                    <tr className="bg-slate-50/30 dark:bg-slate-800/30">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Rincian Transaksi</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">ID Transaksi:</span>
                              <span className="font-mono text-slate-800 dark:text-slate-200">{t.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Kategori:</span>
                              <span className="text-slate-800 dark:text-slate-200">{t.mainCategory} - {t.subCategory}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Nominal:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Rp {formatCurrency(t.amount)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                              <p className="text-slate-600 dark:text-slate-400 text-xs">Deskripsi:</p>
                              <p className="text-slate-800 dark:text-slate-200 text-sm">{t.description || '-'}</p>
                            </div>
                            {/* tampilkan transaction.product_id, transaction_item.name, transaction_item.quantity */}
                            {t.items && t.items.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Detail Produk:</p>
                                {t.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                                    <span className="text-slate-600 dark:text-slate-400">x{item.quantity} • Rp {formatCurrency(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                              <button
                                onClick={() => {
                                  const { printReceipt } = TransactionReceiptPrinter({ transaction: t });
                                  printReceipt();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Printer size={16} />
                                Cetak Struk
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                    <History className="mx-auto mb-2 opacity-20" size={48} />
                    <p>Tidak ada transaksi yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
