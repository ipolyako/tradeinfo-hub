
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Transaction = {
  date: string;
  symbol: string;
  action: string; // Renamed from 'type' to 'action' for clarity
  quantity: number;
  alertTime: string; // Added alertTime field
};

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        setIsLoading(true);
        
        // Using mock data since the Google Drive link isn't accessible
        const mockTransactions: Transaction[] = [
          { action: "BUY", symbol: "AAPL", quantity: 100, date: "2025-05-01", alertTime: "09:30:00" },
          { action: "SELL", symbol: "MSFT", quantity: 50, date: "2025-05-02", alertTime: "10:15:00" },
          { action: "BUY", symbol: "GOOGL", quantity: 25, date: "2025-05-03", alertTime: "11:45:00" },
          { action: "SELL", symbol: "AMZN", quantity: 30, date: "2025-05-04", alertTime: "13:20:00" },
          { action: "BUY", symbol: "TSLA", quantity: 15, date: "2025-05-05", alertTime: "14:30:00" },
          { action: "BUY", symbol: "NVDA", quantity: 40, date: "2025-05-05", alertTime: "15:10:00" },
          { action: "SELL", symbol: "META", quantity: 60, date: "2025-05-05", alertTime: "15:45:00" },
        ];
        
        // Sort the transactions by alertTime in ascending order
        const sortedData = mockTransactions.sort((a, b) => {
          return a.alertTime.localeCompare(b.alertTime);
        });
        
        setTransactions(sortedData);
        toast({
          title: "Data loaded successfully",
          description: "Using sample transaction data for demonstration"
        });
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions data. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not fetch transaction data"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsData();
  }, []);

  // Note: We're not using parseCSV anymore since we're using mock data
  
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead> 
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Alert Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.action}</TableCell>
                          <TableCell>{transaction.symbol}</TableCell>
                          <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                          <TableCell>{transaction.alertTime}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsHistory;
