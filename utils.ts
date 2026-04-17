
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseFormattedNumber = (value: string): number => {
  return Number(value.replace(/[^0-9]/g, ''));
};

export const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

export const formatDate = (date: string | Date) => {
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'Tanggal tidak valid';
    }
    
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Format tanggal error';
  }
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent) || window.innerWidth < 768;
};

export const isDesktopDevice = (): boolean => {
  return !isMobileDevice();
};
