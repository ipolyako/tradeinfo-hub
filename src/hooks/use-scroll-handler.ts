import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useScrollHandler = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const preventScrollLock = () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };

    // Run on mount
    preventScrollLock();

    // Run periodically to ensure scroll remains unlocked
    const interval = setInterval(preventScrollLock, 1000);

    // Clean up
    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobile]);
}; 