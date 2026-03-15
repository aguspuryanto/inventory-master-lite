import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { useToast } from '../components/toast';
import { db } from '../services/db';
import { LocalStorageService } from '../services/local-storage';
import { Product } from '../types';

interface SyncButtonsProps {
  onlineStatus: {
    isOnline: boolean;
    isSupabaseAvailable: boolean;
  };
  isOnlineMode: boolean;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
  setSyncStatus: (status: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const SyncButtons: React.FC<SyncButtonsProps> = ({
  onlineStatus,
  isOnlineMode,
  isSyncing,
  setIsSyncing,
  setSyncStatus,
  setProducts
}) => {
  const { addToast } = useToast();

  const handleSyncToServer = async () => {
    setIsSyncing(true);
    setSyncStatus('Sinkronisasi...');
    try {
      const localProducts = LocalStorageService.loadProducts();
      for (const product of localProducts) {
        await db.addProduct(product);
      }
      const freshProducts = await db.getProducts();
      setProducts(freshProducts);
      addToast({
        type: 'success',
        title: 'Sinkronisasi berhasil',
        message: `${localProducts.length} produk berhasil disinkronkan`
      });
    } catch (error) {
      console.error('Sync error:', error);
      addToast({
        type: 'error',
        title: 'Sinkronisasi gagal',
        message: 'Terjadi kesalahan saat menyinkronkan data'
      });
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const handleRefreshFromServer = async () => {
    setIsSyncing(true);
    setSyncStatus('Mengunduh data...');
    try {
      const onlineProducts = await db.getProducts();
      setProducts(onlineProducts);
      LocalStorageService.saveProducts(onlineProducts);
      addToast({
        type: 'success',
        title: 'Data berhasil diunduh',
        message: `${onlineProducts.length} produk berhasil diunduh dari server`
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        type: 'error',
        title: 'Pengunduhan gagal',
        message: 'Terjadi kesalahan saat mengunduh data dari server'
      });
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  if (!onlineStatus.isSupabaseAvailable) {
    return null;
  }

  return (
    <>
      {!isOnlineMode && (
        <button 
          onClick={handleSyncToServer}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
        >
          <Database size={18} />
          {isSyncing ? 'Menyinkron...' : 'Sync ke Server'}
        </button>
      )}
      {isOnlineMode && (
        <button 
          onClick={handleRefreshFromServer}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} />
          {isSyncing ? 'Mengunduh...' : 'Refresh dari Server'}
        </button>
      )}
    </>
  );
};
