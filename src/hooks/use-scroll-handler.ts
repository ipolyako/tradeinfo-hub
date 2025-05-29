import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useScrollHandler = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const preventScrollLock = () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.style.position = 'relative';
      document.documentElement.style.position = 'relative';
      document.body.style.height = 'auto';
      document.documentElement.style.height = 'auto';
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || target.closest('iframe')) {
        return;
      }
      preventScrollLock();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || target.closest('iframe')) {
        return;
      }
      preventScrollLock();
    };

    // Run on mount
    preventScrollLock();

    // Run more frequently to ensure scroll remains unlocked
    const interval = setInterval(preventScrollLock, 500);

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Clean up
    return () => {
      clearInterval(interval);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.position = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };
  }, [isMobile]);
}; 