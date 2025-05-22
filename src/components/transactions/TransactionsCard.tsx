
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionsPagination } from "./TransactionsPagination";
import { Transaction } from "@/hooks/useTransactions";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Format the date and time to show exactly as in the database
  const formatAlertDateTime = (dateStr: string, timeStr: string): string => {
    return timeStr; // Return the raw timestamp
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{isMobile ? "Transactions" : "Transactions History - 2025"}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-16">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm sm:text-base">Loading transactions data...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        
        {(transactions.length > 0 || isLoading) && (
          <>
            <div className="max-w-full overflow-auto">
              <TransactionsTable 
                transactions={paginatedTransactions} 
                formatAlertDateTime={formatAlertDateTime} 
              />
            </div>
            
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
