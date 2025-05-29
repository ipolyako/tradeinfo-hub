import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = () => {
      // Force a reflow
      document.body.offsetHeight;
      
      // Set viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Ensure body is properly sized
      document.body.style.minHeight = '100vh';
      document.body.style.minHeight = 'calc(var(--vh, 1vh) * 100)';
      
      // Ensure body is scrollable
      document.body.style.overflow = 'auto';
      
      // Force a repaint
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
      
      setIsInitialized(true);
    };

    initialize();

    // Update on resize and orientation change
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}; 