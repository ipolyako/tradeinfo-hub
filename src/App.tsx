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

// Loading component for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Page transition handler
const PageTransitionHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  useViewportHeight();

  useEffect(() => {
    const handleRouteChange = async () => {
      setIsLoading(true);

      // Store current scroll position
      const scrollPos = window.scrollY;

      // Reset scroll position
      window.scrollTo(0, 0);

      // Wait for the next tick
      await new Promise(resolve => setTimeout(resolve, 0));

      // Update viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // Ensure the page is scrollable
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.minHeight = '100vh';
      document.body.style.minHeight = 'calc(var(--vh, 1vh) * 100)';

      // Reset loading state
      setIsLoading(false);

      // Restore scroll position if needed
      if (scrollPos > 0) {
        window.scrollTo(0, scrollPos);
      }
    };

    handleRouteChange();
  }, [location.pathname]);

  return (
    <div 
      className={`min-h-screen transition-opacity duration-300 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {children}
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
        </PageTransitionHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
