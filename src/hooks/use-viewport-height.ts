import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useViewportHeight = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial update
    updateHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, [isMobile]);
}; 