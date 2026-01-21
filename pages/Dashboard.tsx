
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Product, Transaction, MonthlyStats } from '../types';
import { formatCurrency } from '../utils';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
}

const KPICard: React.FC<{ 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  color: string,
  subtitle?: string,
  trend?: { type: 'up' | 'down', value: string }
}> = ({ title, value, icon, color, subtitle, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className={`${color} p-3 rounded-xl`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.type === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {trend.type === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ products, transactions }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const years = useMemo(() => {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const result = [];
    for (let i = currentYear; i >= startYear; i--) result.push(i);
    return result;
  }, []);

  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    
    const incoming = transactions
      .filter(t => t.type === 'IN')
      .reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
      
    const outgoing = transactions
      .filter(t => t.type === 'OUT')
      .reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    return { totalStock, lowStockCount, incoming, outgoing };
  }, [products, transactions]);

  const chartData: MonthlyStats[] = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((month, index) => {
      const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      });
      
      return {
        month,
        incoming: filtered
          .filter(t => t.type === 'IN')
          .reduce((acc, t) => acc + t.items.reduce((sum, i) => sum + i.quantity, 0), 0),
        outgoing: filtered
          .filter(t => t.type === 'OUT')
          .reduce((acc, t) => acc + t.items.reduce((sum, i) => sum + i.quantity, 0), 0)
      };
    });
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ringkasan Gudang</h1>
          <p className="text-slate-500">Pantau pergerakan stok barang secara real-time</p>
        </div>
        
        {/* Year Selector Logic */}
        <div className="bg-white p-1 rounded-xl border border-slate-100 flex items-center shadow-sm">
          {years.length <= 4 ? (
            years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedYear === y ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'
                }`}
              >
                {y}
              </button>
            ))
          ) : (
            <div className="relative inline-block">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-transparent pl-4 pr-10 py-2 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Stok Tersedia" 
          value={formatCurrency(stats.totalStock)} 
          icon={<Package className="text-purple-600" />} 
          color="bg-purple-50"
          trend={{ type: 'up', value: '+12%' }}
        />
        <KPICard 
          title="Barang Masuk" 
          value={formatCurrency(stats.incoming)} 
          icon={<TrendingUp className="text-blue-600" />} 
          color="bg-blue-50"
          subtitle="Total periode ini"
        />
        <KPICard 
          title="Barang Keluar" 
          value={formatCurrency(stats.outgoing)} 
          icon={<TrendingDown className="text-rose-600" />} 
          color="bg-rose-50"
          subtitle="Total periode ini"
        />
        <KPICard 
          title="Stok Menipis" 
          value={stats.lowStockCount} 
          icon={<AlertTriangle className="text-amber-600" />} 
          color="bg-amber-50"
          subtitle="Segera restock barang"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg">Statistik Pergerakan Barang {selectedYear}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-3 h-3 bg-purple-500 rounded-sm"></span> Masuk
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-3 h-3 bg-slate-200 rounded-sm"></span> Keluar
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  label={{ value: 'Jumlah Unit', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#94a3b8' }}}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="incoming" 
                  name="Masuk" 
                  fill="#9333ea" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
                <Bar 
                  dataKey="outgoing" 
                  name="Keluar" 
                  fill="#e2e8f0" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            Peringatan Stok <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">{stats.lowStockCount}</span>
          </h3>
          <div className="space-y-4">
            {products
              .filter(p => p.stock <= 10)
              .sort((a, b) => a.stock - b.stock)
              .slice(0, 6)
              .map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 leading-tight">{p.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{p.code}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold px-2 py-1 rounded ${p.stock <= 5 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
                    {p.stock} <span className="text-[10px] font-medium opacity-70">pcs</span>
                  </div>
                </div>
              ))}
            {stats.lowStockCount === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} />
                </div>
                <p className="text-slate-500 text-sm">Semua stok terpantau aman.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
