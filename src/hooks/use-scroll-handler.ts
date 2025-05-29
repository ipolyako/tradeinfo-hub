import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useScrollHandler = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Reset any potential scroll locks
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobile]);
}; 