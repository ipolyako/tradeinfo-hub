
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Transaction = {
  date: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  // Removed amount field from type definition
};

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        setIsLoading(true);
        // Using the CSV version of the Google Sheets for direct data access
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/1FBZGz441RnGxQQd7h470adxTtHrOvZ6d/export?format=csv"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch transactions data");
        }
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setTransactions(parsedData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsData();
  }, []);

  // Simple CSV parser function - updated to not include amount
  const parseCSV = (csvText: string): Transaction[] => {
    const lines = csvText.split("\n");
    // Skip the header row and empty lines
    const data = lines
      .filter(line => line.trim() !== "")
      .slice(1)
      .map(line => {
        const values = line.split(",");
        return {
          date: values[0] || "",
          symbol: values[1] || "",
          type: values[2] || "",
          quantity: parseFloat(values[3]) || 0,
          price: parseFloat(values[4]) || 0,
          // Removed amount field
        };
      });
    return data;
  };

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
                      <TableHead>Date</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price ($)</TableHead>
                      {/* Removed Amount column header */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.symbol}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${transaction.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          {/* Removed Amount column cell */}
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
