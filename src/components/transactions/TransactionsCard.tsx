
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsPagination } from "./TransactionsPagination";
import { Transaction } from "@/hooks/useTransactions";

interface TransactionsCardProps {
  isLoading: boolean;
  error: string | null;
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const TransactionsCard: React.FC<TransactionsCardProps> = ({
  isLoading,
  error,
  transactions,
  paginatedTransactions,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  // Format the date and time to show in a readable format
  const formatAlertDateTime = (dateStr: string, timeStr: string): string => {
    // Create a new date object from the database timestamp
    try {
      // Format: YYYY-MM-DD HH:MM:SS
      return `${dateStr} ${timeStr}`;
    } catch (error) {
      console.error("Error formatting date time:", error);
      return `${dateStr} ${timeStr}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions History - 2025</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading transactions data...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        
        {(transactions.length > 0 || isLoading) && (
          <>
            <TransactionsTable 
              transactions={paginatedTransactions} 
              formatAlertDateTime={formatAlertDateTime} 
            />
            
            <TransactionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
