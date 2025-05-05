
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
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface TradeData {
  date: string;
  algorithm: string;
  trades: number;
  winRate: string;
  profitFactor: number;
  netPL: string;
  return: string;
}

const PerformanceTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TradeData[]>([]);

  useEffect(() => {
    // In a real application, you would fetch data from an API
    // For this demo, we'll use hardcoded data
    setTimeout(() => {
      try {
        // Empty data array
        const data: TradeData[] = [];
        
        setTableData(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setIsLoading(false);
        console.error("Error loading data:", err);
      }
    }, 1000); // Simulate loading delay
  }, []);

  // Calculate averages for the summary
  const calculateSummary = () => {
    if (tableData.length === 0) return null;
    
    const trades = tableData.reduce((sum, row) => sum + row.trades, 0);
    const avgWinRate = (tableData.reduce((sum, row) => sum + parseFloat(row.winRate), 0) / tableData.length).toFixed(1) + '%';
    const avgProfitFactor = (tableData.reduce((sum, row) => sum + row.profitFactor, 0) / tableData.length).toFixed(2);
    
    // Calculate the net P&L by summing the values (removing $ and , characters)
    const totalNetPL = tableData.reduce((sum, row) => {
      const value = parseFloat(row.netPL.replace('$', '').replace(',', ''));
      return sum + value;
    }, 0);
    
    // Calculate the average monthly return
    const avgReturn = (tableData.reduce((sum, row) => sum + parseFloat(row.return), 0) / tableData.length).toFixed(1) + '%';
    
    return {
      period: "0 Months",
      trades,
      avgWinRate,
      avgProfitFactor,
      totalNetPL: `$${totalNetPL.toLocaleString()}`,
      avgReturn
    };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Algorithm Performance</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center p-12 bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Performance Data Available</h3>
            <p className="text-muted-foreground">Performance data will be displayed here once available.</p>
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
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
                      <p className="text-sm text-muted-foreground">Avg Monthly Return</p>
                      <p className="text-2xl font-bold">{summary.avgReturn}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Monthly trading performance</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">Profit Factor</TableHead>
                      <TableHead className="text-right">Net P&L</TableHead>
                      <TableHead className="text-right">Return</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell>{row.algorithm}</TableCell>
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
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Data is updated monthly. Last updated: May 5, 2025</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceTable;
