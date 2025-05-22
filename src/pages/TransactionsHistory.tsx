
import React from "react";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { useIsMobile } from "@/hooks/use-mobile";

const TransactionsHistory = () => {
  const isMobile = useIsMobile();
  const {
    transactions,
    paginatedTransactions,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useTransactions();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4 sm:mb-8">
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Back to Home</span>
        </Link>
        
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
            <h1 className="text-xl sm:text-3xl font-bold">{isMobile ? "Transactions" : "Transactions History"}</h1>
          </div>
        </div>
        
        <TransactionsCard 
          isLoading={isLoading}
          error={error}
          transactions={transactions}
          paginatedTransactions={paginatedTransactions}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TransactionsHistory;
