
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

// Lazy load heavy components to improve initial load time
const Index = lazy(() => import("./pages/Index"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const Stats = lazy(() => import("./pages/Stats"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Account = lazy(() => import("./pages/Account"));
const Payments = lazy(() => import("./pages/Payments"));
const PerformanceTable = lazy(() => import("./pages/PerformanceTable"));
const SpreadsheetView = lazy(() => import("./pages/SpreadsheetView"));
const TransactionsHistory = lazy(() => import("./pages/TransactionsHistory"));

// Even though we've moved to a real Edge Function, keep this import
// to maintain backward compatibility
import "./functions/cancel-subscription";

// Optimize query client for mobile with more aggressive settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2, // Increase retries for mobile networks
      refetchOnWindowFocus: false, // Disable on mobile to save resources
      refetchOnReconnect: true, // Re-fetch when network reconnects
    },
  },
});

// Enhanced loading component for lazy routes with timeout handling
const PageLoader = () => {
  useEffect(() => {
    // Force a repaint to ensure UI updates on iOS
    const timer = setTimeout(() => {
      if (document.body) {
        document.body.style.transform = 'translateZ(0)';
        setTimeout(() => {
          document.body.style.transform = '';
        }, 10);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

// Mobile-specific viewport handling
const MobileViewportHandler = () => {
  useEffect(() => {
    // Fix viewport issues on mobile devices
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });

    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (window.innerWidth < 768) {
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
        }
      });
      
      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }
      });
    });

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MobileViewportHandler />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/account" element={<Account />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/performance" element={<PerformanceTable />} />
            <Route path="/transactions" element={<TransactionsHistory />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
