
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TradeData {
  date: string;
  symbol: string;
  action: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  returnPercent: number;
}

export function CurrentYearPerformance() {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [currentYearData, setCurrentYearData] = useState<TradeData[]>([]);

  useEffect(() => {
    // This is mock data representing what would be fetched from a real API
    // In a real implementation, this would be replaced with an actual API call
    const fetchCurrentYearData = () => {
      setIsLoading(true);
      // Simulating API call with setTimeout
      setTimeout(() => {
        // Sample data that would come from your Google Doc
        const mockData: TradeData[] = [
          {
            date: "2025-01-05",
            symbol: "AAPL",
            action: "BUY/SELL",
            quantity: 100,
            entryPrice: 185.25,
            exitPrice: 192.45,
            pnl: 720,
            returnPercent: 3.89
          },
          {
            date: "2025-01-12",
            symbol: "MSFT",
            action: "BUY/SELL",
            quantity: 50,
            entryPrice: 402.35,
            exitPrice: 418.80,
            pnl: 822.5,
            returnPercent: 4.09
          },
          {
            date: "2025-01-20",
            symbol: "NVDA",
            action: "BUY/SELL",
            quantity: 25,
            entryPrice: 625.10,
            exitPrice: 681.25,
            pnl: 1403.75,
            returnPercent: 8.98
          },
          {
            date: "2025-02-03",
            symbol: "AMZN",
            action: "BUY/SELL",
            quantity: 40,
            entryPrice: 168.45,
            exitPrice: 175.35,
            pnl: 276,
            returnPercent: 4.10
          },
          {
            date: "2025-02-15",
            symbol: "GOOGL",
            action: "BUY/SELL",
            quantity: 30,
            entryPrice: 145.75,
            exitPrice: 152.80,
            pnl: 211.5,
            returnPercent: 4.84
          }
        ];
        
        setCurrentYearData(mockData);
        setIsLoading(false);
      }, 1000);
    };

    fetchCurrentYearData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Year Trades</h2>
        <p className="text-muted-foreground">
          Performance data for the current trading year
        </p>
      </div>

      <div className={`overflow-x-auto ${isMobile ? '-mx-4' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Entry Price</TableHead>
              <TableHead className="text-right">Exit Price</TableHead>
              <TableHead className="text-right">P&L ($)</TableHead>
              <TableHead className="text-right">Return %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentYearData.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{trade.date}</TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>{trade.action}</TableCell>
                <TableCell className="text-right">{trade.quantity}</TableCell>
                <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${trade.exitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${trade.pnl.toFixed(2)}</TableCell>
                <TableCell className="text-right">{trade.returnPercent.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>Note: This data represents trades completed in the current year. For a complete trading history, please refer to the Historical Performance tab.</p>
      </div>
    </div>
  );
}
