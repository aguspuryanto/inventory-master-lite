
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard,
  Barcode,
  X,
  Printer,
  ChevronRight,
  Calculator,
  ScanLine,
  // Added Package icon
  Package
} from 'lucide-react';
import { Product, Transaction, TransactionItem } from '../types';
import { formatCurrency, generateId } from '../utils';

interface POSProps {
  products: Product[];
  onCheckout: (tx: Transaction) => void;
}

const POS: React.FC<POSProps> = ({ products, onCheckout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)) && p.stock > 0
  );

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const change = Number(paymentAmount.replace(/\D/g, '')) - total;

  useEffect(() => {
    // Focus search on mount
    searchInputRef.current?.focus();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice
      }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        const product = products.find(p => p.id === productId);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = () => {
    const amount = Number(paymentAmount.replace(/\D/g, ''));
    if (amount < total) {
      alert('Pembayaran kurang!');
      return;
    }

    const newTx: Transaction = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: 'OUT',
      items: [...cart],
      total,
      paymentAmount: amount,
      changeAmount: amount - total
    };

    onCheckout(newTx);
    setCart([]);
    setIsCheckoutOpen(false);
    setPaymentAmount('0');
    setShowReceipt(newTx);
  };

  return (
    <div className="h-full flex flex-col gap-6 lg:flex-row">
      {/* Product Selection */}
      <div className="flex-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Cari barang atau scan barcode..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="hidden md:block text-[10px] font-bold text-slate-300 border border-slate-100 px-1.5 py-0.5 rounded">CTRL + F</span>
            <Barcode className="text-slate-300" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left flex flex-col h-full group"
            >
              <div className="w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-purple-50 transition-colors">
                <Package className="text-slate-300 group-hover:text-purple-300" size={32} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{p.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{p.category}</p>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <p className="text-purple-600 font-bold">Rp {formatCurrency(p.sellingPrice)}</p>
                <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  {p.stock}
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center opacity-40">
              <ScanLine size={48} className="mb-2" />
              <p>Produk tidak ditemukan atau stok habis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-purple-600" />
            Keranjang
          </h3>
          <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
            {cart.length} Jenis
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {cart.map(item => (
            <div key={item.productId} className="bg-slate-50 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-start">
                <h5 className="font-bold text-slate-700 text-sm">{item.name}</h5>
                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="text-rose-400 hover:text-rose-600">
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-purple-600 font-bold text-sm">Rp {formatCurrency(item.price)}</p>
                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-slate-100">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-50 rounded text-slate-400">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-50 rounded text-slate-400">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
              <ShoppingCart size={48} />
              <p className="text-sm font-medium">Belum ada barang di keranjang</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>Rp {formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold text-xl pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-purple-600">Rp {formatCurrency(total)}</span>
            </div>
          </div>
          
          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-purple-100 transition-all"
          >
            Bayar Sekarang
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-purple-600 text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Checkout Pembayaran</h3>
                <button onClick={() => setIsCheckoutOpen(false)}><X size={20} /></button>
              </div>
              <div className="text-center py-4">
                <p className="text-purple-100 text-sm mb-1 uppercase tracking-widest font-bold">Total Tagihan</p>
                <h2 className="text-4xl font-black">Rp {formatCurrency(total)}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <CreditCard size={14} /> Jumlah Bayar
                </label>
                <input 
                  autoFocus
                  type="text"
                  value={paymentAmount === '0' ? '' : formatCurrency(Number(paymentAmount.replace(/\D/g, '')))}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPaymentAmount(val || '0');
                  }}
                  placeholder="0"
                  className="w-full text-3xl font-bold text-right py-4 px-4 border-2 border-slate-100 rounded-2xl focus:border-purple-500 outline-none transition-all"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Kembalian</span>
                  <span className={`text-xl font-bold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Rp {formatCurrency(Math.max(0, change))}
                  </span>
                </div>
                {change < 0 && (
                  <p className="text-rose-500 text-xs text-right font-medium animate-pulse">Kurang: Rp {formatCurrency(Math.abs(change))}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[50000, 100000, 200000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setPaymentAmount(amt.toString())}
                    className="py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Rp {formatCurrency(amt)}
                  </button>
                ))}
                <button 
                  onClick={() => setPaymentAmount(total.toString())}
                  className="py-3 bg-slate-100 rounded-xl font-bold text-slate-800 hover:bg-slate-200"
                >
                  Uang Pas
                </button>
              </div>

              <button 
                disabled={change < 0}
                onClick={handleCheckout}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-100 disabled:bg-slate-200 transition-all"
              >
                Selesaikan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview */}
      {showReceipt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowReceipt(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 animate-in slide-in-from-bottom-10 duration-300">
            <div className="text-center space-y-1 mb-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase">InvMaster POS</h2>
              <p className="text-xs text-slate-500">Gedung Sudirman Lantai 4, Jakarta</p>
              <p className="text-xs text-slate-500">Telp: (021) 12345678</p>
            </div>

            <div className="border-t border-dashed border-slate-200 py-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{showReceipt.id}</span>
                <span>{new Date(showReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Kasir: Admin Utama</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 py-4 space-y-3">
              {showReceipt.items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} x Rp {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-slate-700">Rp {formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 py-4 space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-lg">Rp {formatCurrency(showReceipt.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tunai</span>
                <span>Rp {formatCurrency(showReceipt.paymentAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Kembali</span>
                <span>Rp {formatCurrency(showReceipt.changeAmount || 0)}</span>
              </div>
            </div>

            <div className="text-center mt-8 space-y-4">
              <p className="text-xs text-slate-400 font-medium">Terima kasih telah berbelanja!</p>
              <button 
                onClick={() => setShowReceipt(null)}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
