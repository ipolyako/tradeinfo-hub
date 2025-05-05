
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Mock transaction data for 2025
const transactionData = [
  { date: "2025-05-01", description: "Market Buy - AAPL", amount: 1250.75, shares: 5, price: 250.15, type: "Buy" },
  { date: "2025-04-15", description: "Market Sell - MSFT", amount: 875.30, shares: 3, price: 291.77, type: "Sell" },
  { date: "2025-04-05", description: "Limit Buy - GOOGL", amount: 2340.60, shares: 2, price: 1170.30, type: "Buy" },
  { date: "2025-03-22", description: "Dividend - JNJ", amount: 125.40, shares: null, price: null, type: "Dividend" },
  { date: "2025-03-10", description: "Deposit", amount: 5000.00, shares: null, price: null, type: "Deposit" },
  { date: "2025-02-28", description: "Market Sell - AMZN", amount: 1785.25, shares: 1, price: 1785.25, type: "Sell" },
  { date: "2025-02-15", description: "Limit Buy - NVDA", amount: 1450.80, shares: 4, price: 362.70, type: "Buy" },
  { date: "2025-01-30", description: "Withdrawal", amount: 2000.00, shares: null, price: null, type: "Withdrawal" },
  { date: "2025-01-18", description: "Market Buy - TSLA", amount: 1980.50, shares: 3, price: 660.17, type: "Buy" },
  { date: "2025-01-05", description: "Dividend - MSFT", amount: 87.25, shares: null, price: null, type: "Dividend" },
];

const TransactionsHistory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Transactions History</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Transactions Summary - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Buys</p>
                <p className="text-2xl font-bold">$7,022.65</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sells</p>
                <p className="text-2xl font-bold">$2,660.55</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposits</p>
                <p className="text-2xl font-bold">$5,000.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawals</p>
                <p className="text-2xl font-bold">$2,000.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Transaction history for 2025</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`text-right ${
                      transaction.type === "Sell" || transaction.type === "Dividend" ? "text-green-600" : 
                      transaction.type === "Buy" || transaction.type === "Withdrawal" ? "text-red-600" : ""
                    }`}>
                      {transaction.type === "Sell" || transaction.type === "Dividend" ? "+" : 
                       transaction.type === "Buy" || transaction.type === "Withdrawal" ? "-" : ""}
                      ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.shares !== null ? transaction.shares : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.price !== null ? 
                        `$${transaction.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                        "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "Buy" ? "bg-blue-100 text-blue-800" : 
                        transaction.type === "Sell" ? "bg-green-100 text-green-800" : 
                        transaction.type === "Dividend" ? "bg-purple-100 text-purple-800" : 
                        transaction.type === "Deposit" ? "bg-emerald-100 text-emerald-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionsHistory;
