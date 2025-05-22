
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

type Transaction = {
  date: string;
  symbol: string;
  action: string;
  quantity: number;
  alertTime: string;
  tradeprice?: number;
};

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactionsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching data from Supabase alerthist table");
      
      // Add timestamp to query parameter to prevent caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('alerthist')
        .select('*', { count: 'exact' })
        .order('symbol', { ascending: true })
        .order('alerttime', { ascending: true });
      
      console.log(`Query executed at ${timestamp} to prevent caching`);
      console.log('Full query result:', data);
      
      if (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
      
      console.log("Data fetched successfully:", data?.slice(0, 2)); // Log first 2 items
      
      // Map the data from Supabase to our Transaction type
      const mappedData: Transaction[] = (data || []).map((item: any) => ({
        // Store date part (YYYY-MM-DD) in date field
        date: new Date(item.alerttime).toISOString().split('T')[0],
        symbol: item.symbol || "",
        action: item.action || "",
        quantity: item.tradesize || 0,
        // Store time part (HH:MM:SS) in alertTime field
        alertTime: new Date(item.alerttime).toISOString().split('T')[1].substring(0, 8),
        tradeprice: item.tradeprice || 0,
      }));
      
      console.log(`Mapped ${mappedData.length} transactions from database`);
      setTransactions(mappedData);
      toast({
        title: "Data loaded successfully",
        description: "Transactions data loaded from the database"
      });
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions data. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not fetch transaction data from the database"
      });
      
      // No fallback to mock data anymore - we'll show an error state
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a timestamp to force a fresh fetch each time
    const timestamp = new Date().getTime();
    console.log(`Initializing data fetch at ${timestamp}`);
    fetchTransactionsData();

    // Re-fetch when component unmounts and remounts to ensure fresh data
    return () => {
      console.log('TransactionsHistory unmounting, next mount will fetch fresh data');
    };
  }, []);

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
  
  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead> 
                        <TableHead>Symbol</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Alert Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{transaction.action}</TableCell>
                            <TableCell>{transaction.symbol}</TableCell>
                            <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              {transaction.tradeprice ? transaction.tradeprice.toFixed(2) : 'N/A'}
                            </TableCell>
                            <TableCell>{formatAlertDateTime(transaction.date, transaction.alertTime)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {transactions.length > itemsPerPage && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem className="flex items-center px-4">
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsHistory;
