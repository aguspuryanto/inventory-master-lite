import React from 'react';
import { 
  Bluetooth, 
  BluetoothOff, 
  Wifi, 
  WifiOff, 
  Printer,
  Settings,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useBluetooth } from '../hooks/useBluetooth';
import { BluetoothDeviceInfo } from '../types/bluetooth';

interface BluetoothConnectorProps {
  onDeviceConnected?: (device: any) => void;
  onDeviceDisconnected?: () => void;
  onDataReceived?: (data: DataView) => void;
  className?: string;
}

export const BluetoothConnector: React.FC<BluetoothConnectorProps> = ({
  onDeviceConnected,
  onDeviceDisconnected,
  onDataReceived,
  className = ''
}) => {
  const {
    device,
    isSupported,
    isConnecting,
    error,
    data,
    requestDevice,
    connect,
    disconnect,
    startNotifications,
    stopNotifications
  } = useBluetooth({
    filters: [
      { services: ['0x1234'] },
      { services: ['0x12345678'] },
      { services: ['99999999-0000-1000-8000-00805f9b34fb'] }
    ],
    optionalServices: ['0x1234', '0x12345678', '99999999-0000-1000-8000-00805f9b34fb']
  });

  const handleConnectDevice = async () => {
    await requestDevice();
  };

  const handleConnect = async () => {
    const success = await connect();
    if (success && onDeviceConnected) {
      onDeviceConnected(device?.device);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    if (onDeviceDisconnected) {
      onDeviceDisconnected();
    }
  };

  const handleStartNotifications = async () => {
    if (device?.connected) {
      const success = await startNotifications(
        '0x1234',
        '0x1235',
        (data) => {
          if (onDataReceived) {
            onDataReceived(data);
          }
        }
      );
      return success;
    }
    return false;
  };

  if (!isSupported) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <BluetoothOff className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800">Bluetooth Tidak Didukung</h3>
            <p className="text-sm text-amber-600">
              Browser Anda tidak mendukung Web Bluetooth API. 
              Gunakan Chrome, Edge, atau Opera dengan HTTPS.
            </p>
          </div>
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
              Koneksi Bluetooth Printer
            </h3>
          </div>
          {device && (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
              device.connected 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {device.connected ? (
                <>
                  <Check className="h-3 w-3" />
                  Terhubung
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Terputus
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Device Info */}
      {device && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Device:</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {device.name || 'Unknown Device'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">ID:</span>
              <span className="text-sm font-mono text-slate-800 dark:text-slate-100">
                {device.id}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <div>
              <h4 className="font-semibold text-rose-800">Error</h4>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Display */}
      {data && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Data Diterima:</span>
              <span className="text-xs text-blue-800 dark:text-blue-200">
                {data.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-800">
              <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                {Array.from(new Uint8Array(data.value)).map(b => b.toString(16).padStart(2, '0')).join(' ')}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 space-y-3">
        {!device ? (
          <button
            onClick={handleConnectDevice}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Mencari Device...
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4" />
                Pilih Bluetooth Device
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            {!device.connected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Hubungkan
                  </>
                )}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartNotifications}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Mulai Monitor
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Putuskan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BluetoothConnector;
