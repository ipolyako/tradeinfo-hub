import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load components with better error handling
const Index = lazy(() => 
  import("./pages/Index").catch(() => {
    console.error("Failed to load Index page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const GetStarted = lazy(() => 
  import("./pages/GetStarted").catch(() => {
    console.error("Failed to load GetStarted page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const Stats = lazy(() => 
  import("./pages/Stats").catch(() => {
    console.error("Failed to load Stats page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const TermsOfService = lazy(() => 
  import("./pages/TermsOfService").catch(() => {
    console.error("Failed to load Terms page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const Privacy = lazy(() => 
  import("./pages/Privacy").catch(() => {
    console.error("Failed to load Privacy page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const Account = lazy(() => 
  import("./pages/Account").catch(() => {
    console.error("Failed to load Account page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const Payments = lazy(() => 
  import("./pages/Payments").catch(() => {
    console.error("Failed to load Payments page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const PerformanceTable = lazy(() => 
  import("./pages/PerformanceTable").catch(() => {
    console.error("Failed to load Performance page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const SpreadsheetView = lazy(() => 
  import("./pages/SpreadsheetView").catch(() => {
    console.error("Failed to load Spreadsheet page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

const TransactionsHistory = lazy(() => 
  import("./pages/TransactionsHistory").catch(() => {
    console.error("Failed to load Transactions page");
    return { default: () => <div>Error loading page. Please refresh.</div> };
  })
);

// Keep the import for backward compatibility
import "./functions/cancel-subscription";

// Optimize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Enhanced loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => {
  console.error("App error:", error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
  </ErrorBoundary>
);

export default App;
