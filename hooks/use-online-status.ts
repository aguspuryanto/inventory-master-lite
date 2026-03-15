import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  isSupabaseAvailable: boolean;
  lastChecked: Date;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: navigator.onLine,
    isSupabaseAvailable: false,
    lastChecked: new Date()
  });

  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = navigator.onLine;
      let isSupabaseAvailable = false;

      if (isOnline) {
        try {
          // Simple ping to Supabase to check availability
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          isSupabaseAvailable = true;
        } catch (error) {
          // Try alternative method - check if supabase client exists
          isSupabaseAvailable = !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
        }
      }

      setStatus({
        isOnline,
        isSupabaseAvailable,
        lastChecked: new Date()
      });
    };

    // Initial check
    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isSupabaseAvailable: false,
        lastChecked: new Date()
      }));
    };

    // Periodic check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return status;
}
