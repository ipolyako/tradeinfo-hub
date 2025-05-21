import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import Stats from "./pages/Stats";
import TermsOfService from "./pages/TermsOfService";
import Privacy from "./pages/Privacy";
import Account from "./pages/Account";
import Payments from "./pages/Payments";
import PerformanceTable from "./pages/PerformanceTable";
import SpreadsheetView from "./pages/SpreadsheetView";
import TransactionsHistory from "./pages/TransactionsHistory";

// Even though we've moved to a real Edge Function, keep this import
// to maintain backward compatibility
import "./functions/cancel-subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
