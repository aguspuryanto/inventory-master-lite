import { useState, useEffect } from 'react';

export const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    const checkIsMobile = () => {
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
    };

    checkIsMobile();
    
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return { isMobile, isDesktop: !isMobile };
};
