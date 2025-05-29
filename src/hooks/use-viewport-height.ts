import { useEffect } from 'react';

export const useViewportHeight = () => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateHeight = () => {
      // Clear any pending updates
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce the update to avoid too many calculations
      timeoutId = setTimeout(() => {
        // Get the viewport height
        const vh = window.innerHeight * 0.01;
        
        // Set the CSS variable
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Force a repaint
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';
      }, 100);
    };

    // Initial update
    updateHeight();

    // Update on resize, orientation change, and visibility change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    document.addEventListener('visibilitychange', updateHeight);

    // Update when the virtual keyboard appears/disappears on mobile
    if ('virtualKeyboard' in navigator) {
      (navigator as any).virtualKeyboard.addEventListener('geometrychange', updateHeight);
    }

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      document.removeEventListener('visibilitychange', updateHeight);
      if ('virtualKeyboard' in navigator) {
        (navigator as any).virtualKeyboard.removeEventListener('geometrychange', updateHeight);
      }
    };
  }, []);
}; 