
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  PieChart as PieChartIcon, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Transaction, Product } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { DatePicker } from '../components/ui/date-picker';
import { Button } from '../components/ui/button';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, products }) => {
  const { currentStore } = useAuth();
  const [reportType, setReportType] = useState<'STOK' | 'PENJUALAN'>('STOK');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  // const [transactionsData, setTransactionsData] = useState<Transaction[]>(transactions);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchTransactions = async () => {
  //     if (currentStore) {
  //       const txData = await db.getTransactions(currentStore.id);
  //       setTransactionsData(txData);
  //     }
  //     setLoading(false);
  //   };
  //   fetchTransactions();
  // }, [currentStore]);
  // console.log("transactions", transactions);
  // console.log("products", products);

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    
    return true;
  });

  const stats = {
    totalSales: filteredTransactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0),
    totalInventoryValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    topSelling: products.sort((a, b) => b.stock - a.stock).slice(0, 3)
  };

  // Flatten transaction items for table display
  const transactionItems = filteredTransactions
    .filter(t => t.type === 'OUT')
    .flatMap(t => 
      t.items.map(item => ({
        ...item,
        transactionId: t.id,
        createdAt: t.created_at,
        paymentMethod: t.description?.includes('Cash') ? 'Cash' : 'Debit'
      }))
    );

  // Calculate totals
  const totals = {
    quantity: transactionItems.reduce((acc, item) => acc + item.quantity, 0),
    sellingPrice: transactionItems.reduce((acc, item) => acc + item.subtotal, 0),
    hpp: transactionItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    profit: transactionItems.reduce((acc, item) => acc + (item.subtotal - (item.price * item.quantity)), 0)
  };

  const ReportCard: React.FC<{ 
    title: string, 
    description: string, 
    icon: React.ReactNode, 
    onClick: () => void 
  }> = ({ title, description, icon, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-500/50 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
          {icon}
        </div>
        <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
      </div>
      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Laporan Penjualan</h1>
          {/* <p className="text-slate-500 dark:text-slate-400">Analisis penjualan harian, barang terlaris, dan pendapatan kotor</p> */}
        </div>
        {/* <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300">
            <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
            <span>Terakhir 30 Hari</span>
          </div>
        </div> */}
      </div>

      <div className="space-y-4">
          {/* Date Filter */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Filter Tanggal:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex-1">
                  <DatePicker
                    value={dateRange.start}
                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    placeholder="Dari tanggal"
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    value={dateRange.end}
                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    placeholder="Sampai tanggal"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setDateRange({ start: '', end: '' })}
                className="shrink-0"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Periode</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  {dateRange.start && dateRange.end 
                    ? `${new Date(dateRange.start).toLocaleDateString('id-ID')} - ${new Date(dateRange.end).toLocaleDateString('id-ID')}`
                    : dateRange.start 
                    ? `Dari ${new Date(dateRange.start).toLocaleDateString('id-ID')}`
                    : dateRange.end 
                    ? `Sampai ${new Date(dateRange.end).toLocaleDateString('id-ID')}`
                    : 'Semua Data'}
                </p>
              </div>
              <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Total Transaksi</p>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 size={14} />
                  {filteredTransactions.length} transaksi
                </div>
              </div>
            </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Waktu</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Barang</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-center">Jumlah</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">Harga</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Pembayaran</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">HPP</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">Untung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Tidak ada transaksi
                      </td>
                    </tr>
                  ) : transactionItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Tidak ada transaksi penjualan
                      </td>
                    </tr>
                  ) : (
                    transactionItems.map((item, index) => (
                      <tr key={`${item.transactionId}-${index}`}>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                          {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">{item.name}</td>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-800 dark:text-slate-100">{formatCurrency(item.subtotal)}</td>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">{item.paymentMethod}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.price * item.quantity)}</td>
                        <td className="px-3 py-2 text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(item.subtotal - (item.price * item.quantity))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Total row */}
                {transactionItems.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800/50 font-bold">
                      <td className="px-3 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase" colSpan="4">TOTAL PENJUALAN</td>
                      <td className="px-3 py-3 text-sm font-bold text-right text-slate-800 dark:text-slate-100">{formatCurrency(totals.sellingPrice)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-right text-slate-800 dark:text-slate-100">{formatCurrency(totals.hpp)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.profit)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Reports;
