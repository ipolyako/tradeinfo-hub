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
    // Set loading state
    setIsLoading(true);

    // Reset scroll position
    window.scrollTo(0, 0);

    // Preload the next route
    const preloadRoute = async () => {
      try {
        // Wait for the next tick to ensure the new route is mounted
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Wait for any images or heavy content to load
        const images = document.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(
            img => new Promise(resolve => {
              if (img.complete) resolve(null);
              else img.onload = () => resolve(null);
            })
          )
        );

        // Update viewport height after content is loaded
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      } catch (error) {
        console.error('Error preloading route:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadRoute();
  }, [location.pathname]);

  return (
    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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
