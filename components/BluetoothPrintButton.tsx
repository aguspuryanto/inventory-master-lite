import React, { useState } from 'react';
import { 
  Printer, 
  Bluetooth, 
  Check,
  X,
  Settings,
  FileText
} from 'lucide-react';
import { BluetoothPrinter } from './BluetoothPrinter';

interface BluetoothPrintButtonProps {
  receipt: any;
  className?: string;
}

export const BluetoothPrintButton: React.FC<BluetoothPrintButtonProps> = ({
  receipt,
  className = ''
}) => {
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handlePrintComplete = (success: boolean) => {
    if (success) {
      console.log('Receipt printed successfully via Bluetooth');
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-300';
      successMsg.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 9"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17l-3-3m0 0l3 3"></path>
          </svg>
          <span>Struk berhasil dicetak!</span>
        </div>
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 3000);
    } else {
      console.error('Failed to print receipt via Bluetooth');
    }
    setShowPrinterModal(false);
    setIsPrintModalOpen(false);
  };

  const handleDeviceConnected = (device: any) => {
    console.log('Bluetooth printer connected:', device.name);
  };

  const formatReceiptForBluetooth = (receipt: any) => {
    const date = new Date(receipt.date);
    
    return `
===================================
KASIRKU - STRUK PENJUALAN
===================================
${receipt.id}
Tanggal: ${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}

-----------------------------------
ITEM PEMBELAN:
${receipt.items.map((item: any, index: number) => 
  `${(index + 1).toString().padStart(2, '.')} ${item.name.toString().padEnd(20, '.')} ${item.quantity.toString().padStart(3, '.')} x ${formatCurrency(item.price).padStart(10, '.')} = ${formatCurrency(item.subtotal).padStart(12, '.')}`
).join('\n')}

-----------------------------------
SUBTOTAL: ${formatCurrency(receipt.total).padStart(12, '.')}
TUNAI: ${formatCurrency(receipt.paymentAmount).padStart(12, '.')}
KEMBALI: ${formatCurrency(receipt.changeAmount).padStart(12, '.')}

--------------------------------===
TERIMA KASIH
${formatCurrency(receipt.total).padStart(12, '.')}

===================================
       Terima Kasih
    Barang yang sudah dibeli
    tidak dapat dikembalikan
===================================
Printed: ${new Date().toLocaleString('id-ID')}
    `;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleQuickPrint = () => {
    if (!receipt) {
      alert('Tidak ada struk untuk dicetak!');
      return;
    }
    
    const receiptText = formatReceiptForBluetooth(receipt);
    console.log('Printing receipt:', receiptText);
    
    // Create a temporary print job
    const printJob = {
      id: `receipt_${receipt.id}`,
      content: receiptText,
      timestamp: new Date(),
      status: 'pending' as const
    };
    
    // This would be handled by the BluetoothPrinter component
    // For now, just show the modal
    setShowPrinterModal(true);
    setIsPrintModalOpen(true);
  };

  return (
    <>
      {/* Quick Print Button */}
      <button
        onClick={handleQuickPrint}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${className}`}
        title="Cetak via Bluetooth"
      >
        <Printer className="h-4 w-4" />
        Cetak Bluetooth
      </button>

      {/* Bluetooth Printer Modal */}
      {showPrinterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPrinterModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Bluetooth className="h-6 w-6 text-blue-600" />
                Cetak Struk Bluetooth
              </h3>
              <button onClick={() => setShowPrinterModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <BluetoothPrinter
              onPrintComplete={handlePrintComplete}
              onDeviceConnected={handleDeviceConnected}
              className="p-6"
            />
            
            {/* Receipt Preview */}
            {receipt && (
              <div className="border-t border-slate-200 dark:border-slate-700">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Preview Struk
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-700 dark:text-slate-300 max-h-96 overflow-y-auto">
                    <pre>{formatReceiptForBluetooth(receipt)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BluetoothPrintButton;
