
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
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Sample data structure representing ETF trading performance
const performanceData = [
  {
    date: "Apr 2025",
    pairs: "TQQQ/SQQQ",
    trades: 42,
    winRate: "68.5%",
    profitFactor: 2.14,
    netPL: "$12,450",
    return: "4.1%"
  },
  {
    date: "Mar 2025",
    pairs: "TQQQ/SQQQ",
    trades: 38,
    winRate: "71.2%",
    profitFactor: 2.31,
    netPL: "$14,850",
    return: "4.9%"
  },
  {
    date: "Feb 2025",
    pairs: "TQQQ/SQQQ",
    trades: 35,
    winRate: "65.7%",
    profitFactor: 1.89,
    netPL: "$9,720",
    return: "3.2%"
  },
  {
    date: "Jan 2025",
    pairs: "TQQQ/SQQQ",
    trades: 40,
    winRate: "62.5%",
    profitFactor: 1.75,
    netPL: "$8,340",
    return: "2.8%"
  }
];

// Calculate summary stats
const summary = {
  period: "4 Months",
  trades: performanceData.reduce((sum, row) => sum + row.trades, 0),
  avgWinRate: (performanceData.reduce((sum, row) => sum + parseFloat(row.winRate), 0) / performanceData.length).toFixed(1) + '%',
  avgProfitFactor: (performanceData.reduce((sum, row) => sum + row.profitFactor, 0) / performanceData.length).toFixed(2),
  totalNetPL: "$" + performanceData.reduce((sum, row) => {
    const value = parseFloat(row.netPL.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0).toLocaleString(),
  avgReturn: (performanceData.reduce((sum, row) => sum + parseFloat(row.return), 0) / performanceData.length).toFixed(1) + '%'
};

const ComparisonTable = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">ETF Pair Trading Performance</h1>
        <p className="text-lg text-muted-foreground mb-8">Latest Version - Updated May 2025</p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-2xl font-bold">{summary.period}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{summary.trades}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Win Rate</p>
                <p className="text-2xl font-bold">{summary.avgWinRate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit Factor</p>
                <p className="text-2xl font-bold">{summary.avgProfitFactor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Net P&L</p>
                <p className="text-2xl font-bold">{summary.totalNetPL}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly Return</p>
                <p className="text-2xl font-bold">{summary.avgReturn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Monthly trading performance for TQQQ/SQQQ pair</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>ETF Pairs</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Profit Factor</TableHead>
                  <TableHead className="text-right">Net P&L</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.pairs}</TableCell>
                    <TableCell className="text-right">{row.trades}</TableCell>
                    <TableCell className="text-right">{row.winRate}</TableCell>
                    <TableCell className="text-right">{row.profitFactor}</TableCell>
                    <TableCell className="text-right">{row.netPL}</TableCell>
                    <TableCell className="text-right">{row.return}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Trading Strategy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our algorithmic trading strategy focuses on highly liquid ETF pairs such as TQQQ/SQQQ. 
                The algorithm executes precise day trading operations, closing all positions before market close to 
                eliminate overnight exposure risk.
              </p>
              
              <p>
                <strong>Key Strategy Components:</strong>
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Opposite-directional ETF pair trading to capitalize on market volatility</li>
                <li>Advanced signal detection algorithms identifying optimal entry and exit points</li>
                <li>Strict risk management protocols limiting maximum drawdown</li>
                <li>Position sizing optimized for account preservation and consistent growth</li>
                <li>No overnight positions, eliminating gap risk and news exposure</li>
              </ul>
              
              <p className="text-sm text-muted-foreground mt-4">
                *Past performance is not indicative of future results. Trading involves risk of loss.
                All performance data is based on historical backtests and actual trading results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
