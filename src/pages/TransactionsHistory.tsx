
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

// Transaction data from the user's spreadsheet
const transactionData = [
  { date: "2025-05-01", description: "Vanguard BUY AAPL", amount: 3245.67, type: "Buy" },
  { date: "2025-04-28", description: "Interactive Brokers SELL MSFT", amount: 1987.30, type: "Sell" },
  { date: "2025-04-15", description: "Charles Schwab BUY NVDA", amount: 4521.89, type: "Buy" },
  { date: "2025-04-10", description: "DEPOSIT", amount: 10000.00, type: "Deposit" },
  { date: "2025-03-25", description: "Robinhood SELL AMZN", amount: 3678.52, type: "Sell" },
  { date: "2025-03-18", description: "DIVIDEND MSFT", amount: 245.78, type: "Dividend" },
  { date: "2025-03-05", description: "Fidelity BUY TSLA", amount: 5432.10, type: "Buy" },
  { date: "2025-02-20", description: "WITHDRAWAL", amount: 2500.00, type: "Withdrawal" },
  { date: "2025-02-12", description: "TD Ameritrade SELL GOOG", amount: 2987.65, type: "Sell" },
  { date: "2025-02-03", description: "DIVIDEND JNJ", amount: 132.45, type: "Dividend" },
  { date: "2025-01-28", description: "E*TRADE BUY META", amount: 3876.54, type: "Buy" },
  { date: "2025-01-15", description: "DEPOSIT", amount: 5000.00, type: "Deposit" },
  { date: "2025-01-05", description: "Merrill Lynch SELL NFLX", amount: 2345.67, type: "Sell" },
  { date: "2025-01-02", description: "DIVIDEND PG", amount: 89.32, type: "Dividend" },
];

const TransactionsHistory = () => {
  // Calculate summary totals
  const totalBuys = transactionData
    .filter(t => t.type === "Buy")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalSells = transactionData
    .filter(t => t.type === "Sell")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDeposits = transactionData
    .filter(t => t.type === "Deposit")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalWithdrawals = transactionData
    .filter(t => t.type === "Withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDividends = transactionData
    .filter(t => t.type === "Dividend")
    .reduce((sum, t) => sum + t.amount, 0);

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
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Transactions Summary - 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Buys</p>
                <p className="text-2xl font-bold text-red-600">-${totalBuys.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sells</p>
                <p className="text-2xl font-bold text-green-600">+${totalSells.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposits</p>
                <p className="text-2xl font-bold text-emerald-600">+${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">-${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dividends</p>
                <p className="text-2xl font-bold text-purple-600">+${totalDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`text-right ${
                      transaction.type === "Sell" || transaction.type === "Dividend" || transaction.type === "Deposit" ? "text-green-600" : 
                      transaction.type === "Buy" || transaction.type === "Withdrawal" ? "text-red-600" : ""
                    }`}>
                      {transaction.type === "Sell" || transaction.type === "Dividend" || transaction.type === "Deposit" ? "+" : 
                       transaction.type === "Buy" || transaction.type === "Withdrawal" ? "-" : ""}
                      ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
