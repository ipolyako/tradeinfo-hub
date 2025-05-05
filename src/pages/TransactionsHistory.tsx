
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

type Transaction = {
  date: string;
  symbol: string;
  action: string;
  quantity: number;
  alertTime: string;
};

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the data from the Google Drive direct download link
        // Convert the Google Drive sharing link to a direct download link
        const fileId = "1FNsE_bwKg5lDbMkXiEEJqHRH7-kM1TPe";
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Assuming the data is an array of objects with the correct structure
        // Map the data to our Transaction type
        const mappedData: Transaction[] = data.map((item: any) => ({
          date: item.Date || "",
          symbol: item.Symbol || "",
          action: item.Action || "",
          quantity: parseInt(item.Quantity) || 0,
          alertTime: item["Alert Time"] || "",
        }));
        
        // Sort the transactions by date and alertTime in ascending order
        const sortedData = mappedData.sort((a, b) => {
          const dateTimeA = `${a.date} ${a.alertTime}`;
          const dateTimeB = `${b.date} ${b.alertTime}`;
          return dateTimeA.localeCompare(dateTimeB);
        });
        
        setTransactions(sortedData);
        toast({
          title: "Data loaded successfully",
          description: "Transactions data loaded from the provided link"
        });
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions data. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not fetch transaction data from the provided link"
        });
        
        // Fallback to mock data if the fetch fails
        const mockTransactions: Transaction[] = [
          { action: "BUY", symbol: "AAPL", quantity: 100, date: "2025-05-01", alertTime: "09:30:00" },
          { action: "SELL", symbol: "MSFT", quantity: 50, date: "2025-05-02", alertTime: "10:15:00" },
          { action: "BUY", symbol: "GOOGL", quantity: 25, date: "2025-05-03", alertTime: "11:45:00" },
          { action: "SELL", symbol: "AMZN", quantity: 30, date: "2025-05-04", alertTime: "13:20:00" },
          { action: "BUY", symbol: "TSLA", quantity: 15, date: "2025-05-05", alertTime: "14:30:00" },
          { action: "BUY", symbol: "NVDA", quantity: 40, date: "2025-05-05", alertTime: "15:10:00" },
          { action: "SELL", symbol: "META", quantity: 60, date: "2025-05-05", alertTime: "15:45:00" },
        ];
        
        setTransactions(mockTransactions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsData();
  }, []);

  // Function to format the complete date and time
  const formatAlertDateTime = (date: string, time: string): string => {
    // Format the date and time as "YYYY-MM-DD HH:MM:SS"
    return `${date} ${time}`;
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
        
        <div className="flex items-center mb-8">
          <Calendar className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Transactions History</h1>
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
              <div className="text-destructive text-center py-8">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead> 
                        <TableHead>Symbol</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Alert Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{transaction.action}</TableCell>
                            <TableCell>{transaction.symbol}</TableCell>
                            <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
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
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
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
