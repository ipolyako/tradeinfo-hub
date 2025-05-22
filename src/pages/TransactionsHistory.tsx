
import React from "react";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";

const TransactionsHistory = () => {
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Transactions History</h1>
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
