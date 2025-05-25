
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface PerformanceData {
  year: string;
  result: number | null;
  pl_percent: number | null;
  data_source: string | null;
}

interface MobileOptimizedStatsProps {
  performanceData: PerformanceData[];
  isLoading: boolean;
}

const getReturnColor = (value: number | null) => {
  if (value === null) return "text-muted-foreground";
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
};

export const MobileOptimizedStats = memo(({ performanceData, isLoading }: MobileOptimizedStatsProps) => {
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (performanceData.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No historical performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {performanceData.map((row, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="border-primary/30">{row.year}</Badge>
            <span className="px-2 py-1 rounded-full bg-muted text-xs">
              {row.data_source || 'Unknown'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Return %</p>
              <p className={`font-medium ${getReturnColor(row.pl_percent)}`}>
                {row.pl_percent !== null ? `${row.pl_percent.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit and Loss</p>
              <p className={`font-bold ${getReturnColor(row.result)}`}>
                {row.result !== null ? `$${row.result.toLocaleString()}` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});

MobileOptimizedStats.displayName = "MobileOptimizedStats";
