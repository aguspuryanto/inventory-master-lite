import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Send, 
  Settings, 
  Check, 
  X, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { BluetoothConnector } from './BluetoothConnector';
import { useBluetooth } from '../hooks/useBluetooth';
import { BluetoothDeviceInfo } from '../types/bluetooth';

interface BluetoothPrinterProps {
  onPrintComplete?: (success: boolean) => void;
  onDeviceConnected?: (device: any) => void;
  className?: string;
}

interface PrintJob {
  id: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
}

export const BluetoothPrinter: React.FC<BluetoothPrinterProps> = ({
  onPrintComplete,
  onDeviceConnected,
  className = ''
}) => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'idle' | 'connected' | 'printing' | 'error'>('idle');

  const {
    device,
    isSupported,
    isConnecting,
    error,
    data,
    requestDevice,
    connect,
    disconnect,
    writeCharacteristic
  } = useBluetooth({
    filters: [
      { services: ['0x1234'] }, // Generic printer service
      { services: ['0x4953534d-4744-4d45-4d53'] }, // Custom printer service
    ],
    optionalServices: ['0x1234', '0x4953534d-4744-4d45-4d53']
  });

  // Handle device connection
  const handleDeviceConnected = (bluetoothDevice: any) => {
    setPrinterStatus('connected');
    if (onDeviceConnected) {
      onDeviceConnected(bluetoothDevice);
    }
  };

  // Handle device disconnection
  const handleDeviceDisconnected = () => {
    setPrinterStatus('idle');
  };

  // Print text to Bluetooth printer
  const printText = async (text: string) => {
    if (!device?.connected) {
      alert('Printer tidak terhubung!');
      return;
    }

    try {
      setIsPrinting(true);
      setPrinterStatus('printing');

      // Convert text to bytes (assuming UTF-8 encoding)
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Write to printer characteristic
      const success = await writeCharacteristic('0x1234', '0x1235', data.buffer);
      
      if (success) {
        // Update print job status
        setPrintJobs(prev => prev.map(job => 
          job.status === 'printing' 
            ? { ...job, status: 'completed' }
            : job
        ));
        
        setPrinterStatus('connected');
        
        if (onPrintComplete) {
          onPrintComplete(true);
        }
      } else {
        throw new Error('Failed to write to printer');
      }
    } catch (error: any) {
      console.error('Print error:', error);
      
      // Update print job status
      setPrintJobs(prev => prev.map(job => 
        job.status === 'printing' 
          ? { ...job, status: 'failed' }
          : job
      ));
      
      setPrinterStatus('error');
      
      if (onPrintComplete) {
        onPrintComplete(false);
      }
      
      alert('Gagal mencetak: ' + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  // Add print job
  const addPrintJob = (content: string) => {
    const newJob: PrintJob = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      status: 'pending'
    };
    
    setPrintJobs(prev => [...prev, newJob]);
  };

  // Process next print job
  const processNextJob = async () => {
    const pendingJob = printJobs.find(job => job.status === 'pending');
    if (pendingJob && !isPrinting) {
      // Update job status to printing
      setPrintJobs(prev => prev.map(job => 
        job.id === pendingJob.id 
          ? { ...job, status: 'printing' }
          : job
      ));
      
      // Print the job
      await printText(pendingJob.content);
    }
  };

  // Auto-process pending jobs
  useEffect(() => {
    if (device?.connected && printJobs.some(job => job.status === 'pending')) {
      processNextJob();
    }
  }, [device?.connected, printJobs]);

  // Test print function
  const testPrint = async () => {
    const testContent = `
=================================
TEST PRINT - Bluetooth Printer
=================================
Device: ${device?.name || 'Unknown'}
Time: ${new Date().toLocaleString()}
Status: Connected Successfully

This is a test print from KasirKu POS System.
=================================
`;
    
    addPrintJob(testContent);
  };

  // Clear all print jobs
  const clearJobs = () => {
    setPrintJobs([]);
  };

  if (!isSupported) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Bluetooth Printer Tidak Didukung</h3>
          <p className="text-amber-600">
            Browser Anda tidak mendukung Web Bluetooth API. 
            Gunakan Chrome, Edge, atau Opera dengan koneksi HTTPS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Bluetooth Printer
            </h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            printerStatus === 'connected' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : printerStatus === 'printing'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : printerStatus === 'error'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
          }`}>
            {printerStatus === 'connected' && (
              <>
                <Check className="h-3 w-3" />
                Terhubung
              </>
            )}
            {printerStatus === 'printing' && (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-600 border-t-transparent"></div>
                Mencetak
              </>
            )}
            {printerStatus === 'error' && (
              <>
                <X className="h-3 w-3" />
                Error
              </>
            )}
            {printerStatus === 'idle' && (
              <>
                <AlertTriangle className="h-3 w-3" />
                Siaga
              </>
            )}
          </div>
        </div>
      </div>

      {/* Printer Connection */}
      <div className="p-4">
        {!device ? (
          <BluetoothConnector
            onDeviceConnected={handleDeviceConnected}
            onDeviceDisconnected={handleDeviceDisconnected}
            className="mb-4"
          />
        ) : (
          <div className="space-y-4">
            {/* Device Info */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Device:</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {device?.name || 'Unknown Device'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
                  <span className={`text-sm font-semibold ${
                    printerStatus === 'connected' ? 'text-emerald-600' :
                    printerStatus === 'printing' ? 'text-blue-600' :
                    printerStatus === 'error' ? 'text-rose-600' :
                    'text-slate-600'
                  }`}>
                    {printerStatus === 'connected' ? 'Terhubung' :
                     printerStatus === 'printing' ? 'Sedang Mencetak' :
                     printerStatus === 'error' ? 'Error' :
                     'Siaga'}
                  </span>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={testPrint}
                disabled={isPrinting || printerStatus !== 'connected'}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="h-4 w-4" />
                Test Print
              </button>
              <button
                onClick={() => disconnect()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Putuskan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Jobs */}
      {printJobs.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                Antrian Print ({printJobs.length})
              </h4>
              <button
                onClick={clearJobs}
                className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                Hapus Semua
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {printJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      Print Job #{job.id}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {job.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : job.status === 'failed'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      : job.status === 'printing'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                  }`}>
                    {job.status === 'completed' && 'Selesai'}
                    {job.status === 'failed' && 'Gagal'}
                    {job.status === 'printing' && 'Mencetak...'}
                    {job.status === 'pending' && 'Menunggu'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <div>
              <h4 className="font-semibold text-rose-800">Bluetooth Error</h4>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothPrinter;
