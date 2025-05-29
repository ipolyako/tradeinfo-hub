import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useViewportHeight } from "@/hooks/use-viewport-height";

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

// Optimize query client for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduce retries on mobile
      refetchOnWindowFocus: false, // Disable on mobile to save resources
    },
  },
});

// Page transition handler
const PageTransitionHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  useViewportHeight();

  useEffect(() => {
    // Handle initial load
    if (!isInitialized) {
      const initialize = async () => {
        // Force a reflow
        document.body.offsetHeight;
        
        // Set viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Ensure body is properly sized
        document.body.style.minHeight = '100vh';
        document.body.style.minHeight = 'calc(var(--vh, 1vh) * 100)';
        
        // Wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        setIsInitialized(true);
        setIsLoading(false);
      };
      
      initialize();
      return;
    }

    // Handle route changes
    const handleRouteChange = async () => {
      setIsLoading(true);
      window.scrollTo(0, 0);
      await new Promise(resolve => requestAnimationFrame(resolve));
      setIsLoading(false);
    };

    handleRouteChange();
  }, [location.pathname, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className={`flex-1 transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTransitionHandler>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
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
        </PageTransitionHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
