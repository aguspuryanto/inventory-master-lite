
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  ChevronRight, 
  PieChart as PieChartIcon, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Transaction, Product } from '../types';
import { formatCurrency } from '../utils';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, products }) => {
  const [reportType, setReportType] = useState<'STOK' | 'PENJUALAN'>('STOK');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const stats = {
    totalSales: transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.total, 0),
    totalInventoryValue: products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0),
    topSelling: products.sort((a, b) => b.stock - a.stock).slice(0, 3) // Simulating top selling
  };

  const ReportCard: React.FC<{ 
    title: string, 
    description: string, 
    icon: React.ReactNode, 
    onClick: () => void 
  }> = ({ title, description, icon, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
          {icon}
        </div>
        <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Analitik</h1>
          <p className="text-slate-500">Analisis performa inventaris dan penjualan Anda</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
            <Calendar size={18} className="text-purple-600" />
            <span>Terakhir 30 Hari</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportCard 
              title="Laporan Stok Barang" 
              description="Lihat ringkasan stok saat ini, barang masuk, dan nilai total aset inventaris."
              icon={<BarChart3 size={24} />}
              onClick={() => setReportType('STOK')}
            />
            <ReportCard 
              title="Laporan Penjualan" 
              description="Analisis tren penjualan harian, barang terlaris, dan pendapatan kotor."
              icon={<PieChartIcon size={24} />}
              onClick={() => setReportType('PENJUALAN')}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-bold text-slate-800">Review Laporan {reportType === 'STOK' ? 'Inventaris' : 'Penjualan'}</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all">
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Periode</p>
                  <p className="font-bold text-slate-700">Januari 2024 - Sekarang</p>
                </div>
                <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status Laporan</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 size={16} />
                    Siap di-export
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kategori</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportType === 'STOK' ? (
                      <>
                        <tr><td className="px-6 py-4 text-sm font-medium">Total Jenis Barang</td><td className="px-6 py-4 text-sm font-bold text-right">{products.length}</td></tr>
                        <tr><td className="px-6 py-4 text-sm font-medium">Total Stok Tersedia</td><td className="px-6 py-4 text-sm font-bold text-right">{products.reduce((a,b) => a+b.stock, 0)} pcs</td></tr>
                        <tr><td className="px-6 py-4 text-sm font-medium">Nilai Modal Inventaris</td><td className="px-6 py-4 text-sm font-bold text-right text-purple-600">Rp {formatCurrency(stats.totalInventoryValue)}</td></tr>
                      </>
                    ) : (
                      <>
                        <tr><td className="px-6 py-4 text-sm font-medium">Total Transaksi</td><td className="px-6 py-4 text-sm font-bold text-right">{transactions.filter(t=>t.type==='OUT').length}</td></tr>
                        <tr><td className="px-6 py-4 text-sm font-medium">Total Pendapatan</td><td className="px-6 py-4 text-sm font-bold text-right text-emerald-600">Rp {formatCurrency(stats.totalSales)}</td></tr>
                        <tr><td className="px-6 py-4 text-sm font-medium">Rata-rata Penjualan</td><td className="px-6 py-4 text-sm font-bold text-right">Rp {formatCurrency(stats.totalSales / Math.max(1, transactions.filter(t=>t.type==='OUT').length))}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-xl font-bold mb-6">Barang Terlaris</h3>
            <div className="space-y-6">
              {stats.topSelling.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{p.name}</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                      <div 
                        className="bg-white h-full rounded-full" 
                        style={{ width: `${80 - (i * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" />
              Catatan Laporan
            </h3>
            <p className="text-sm text-slate-500 italic">
              "Pastikan untuk melakukan stock opname fisik minimal satu kali dalam sebulan untuk menjaga sinkronisasi data dengan stok asli di gudang."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
